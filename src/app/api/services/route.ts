import { NextRequest, NextResponse } from 'next/server';
import { createConnection, executeQuery } from '@/lib/db';

// GET - Fetch all services for a specific vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT s.service_id, s.vendor_id, s.name, s.description, s.service_category_id, 
             sc.name as category_name, s.type, s.base_price, s.duration_minutes, 
             s.is_available, s.service_pincodes, s.created_at, s.updated_at
      FROM services s
      LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE s.vendor_id = ?
      ORDER BY s.created_at DESC
    `;

    const services = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      services
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {

  try {
    const {
      vendor_id,
      name,
      description,
      service_category_id,
      type,
      base_price,
      duration_minutes,
      is_available,
      service_pincodes,
    } = await request.json();

    if (!vendor_id || !name || !service_category_id || !type || !base_price || !duration_minutes) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate and prepare service_pincodes
    let normalizedPincodes = '';
    if (typeof service_pincodes === 'string' && service_pincodes.trim().length > 0) {
      // Split by comma, clean each pincode, and validate
      const pincodeArray = service_pincodes.split(',')
        .map(pin => pin.trim().replace(/\D/g, ''))
        .filter(pin => pin.length === 6);
      
      // Check if all pincodes are valid 6-digit numbers
      const invalidPincodes = pincodeArray.filter(pin => !/^\d{6}$/.test(pin));
      if (invalidPincodes.length > 0) {
        return NextResponse.json(
          { error: 'Invalid pincode format. All pincodes must be 6-digit numbers' },
          { status: 400 }
        );
      }
      
      // Store comma-separated pincodes for services table (limit to 100 chars to be safe)
      normalizedPincodes = pincodeArray.join(', ');
      if (normalizedPincodes.length > 100) {
        // If too long, truncate and add note
        normalizedPincodes = normalizedPincodes.substring(0, 95) + '...';
      }
    }
    // Begin transactional, vendor-scoped ID generation
    const connection = await createConnection();
    let inTransaction = false;
    try {
      // Ensure sequence tracking table exists (outside explicit transaction; DDL auto-commits)
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS id_sequences (
          id_type VARCHAR(32) NOT NULL,
          scope VARCHAR(64) NOT NULL,
          last_assigned INT NOT NULL DEFAULT 0,
          PRIMARY KEY (id_type, scope)
        ) ENGINE=InnoDB
      `);

      await connection.beginTransaction();
      inTransaction = true;

      // Validate vendor exists first with the original vendor_id
      const [vendorRows] = await connection.execute(
        'SELECT vendor_id FROM vendors WHERE vendor_id = ? FOR UPDATE',
        [vendor_id]
      );
      const vendorExists = Array.isArray(vendorRows) && (vendorRows as any[]).length > 0;
      if (!vendorExists) {
        throw new Error(`Vendor not found: ${vendor_id}`);
      }

      // Prepare vendor prefix SRV + 3-digit vendor number from string vendor_id
      const numericVendorId = parseInt(String(vendor_id).replace(/\D/g, ''), 10);
      if (!Number.isFinite(numericVendorId) || numericVendorId <= 0) {
        throw new Error('Invalid vendor_id format');
      }
      const vendorPrefix = String(numericVendorId).toString().padStart(3, '0');

      // Create (or ensure) sequence lock row for this vendor scope and lock it
      const idType = 'service_id';
      await connection.execute(
        'INSERT INTO id_sequences (id_type, scope, last_assigned) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE last_assigned = last_assigned',
        [idType, vendorPrefix]
      );
      await connection.execute(
        'SELECT last_assigned FROM id_sequences WHERE id_type = ? AND scope = ? FOR UPDATE',
        [idType, vendorPrefix]
      );

      // Find the lowest available sequence number for this vendor by checking generated IDs
      const [idRows] = await connection.execute(
        `SELECT service_id FROM services WHERE vendor_id = ? AND service_id LIKE 'SRV%'`,
        [vendor_id]
      );
      const existingIds = new Set((idRows as any[]).map(r => String(r.service_id)));

      let allocatedSequence = 1;
      for (;;) {
        const seqStr = String(allocatedSequence);
        const sliceIndex = Math.min(vendorPrefix.length, Math.max(0, seqStr.length - 1));
        const vendorPortion = vendorPrefix.slice(sliceIndex);
        // Examples (vendorPrefix='001'):
        // seq=1 -> slice(0) => '001' + '1' => SRV0011
        // seq=10 -> slice(1) => '01' + '10' => SRV0110
        // seq=100 -> slice(2) => '1' + '100' => SRV1100
        // seq=1000 -> slice(3) => '' + '1000' => SRV1000
        const service_id_candidate = `SRV${vendorPortion}${seqStr}`;
        if (!existingIds.has(service_id_candidate)) {
          break;
        }
        allocatedSequence += 1;
      }
      const seqStrFinal = String(allocatedSequence);
      const sliceIndexFinal = Math.min(vendorPrefix.length, Math.max(0, seqStrFinal.length - 1));
      const vendorPortionFinal = vendorPrefix.slice(sliceIndexFinal);
      const service_id = `SRV${vendorPortionFinal}${seqStrFinal}`;

      // Double-check no duplicate exists (under lock row guarantee)
      const [dupCheck] = await connection.execute(
        'SELECT 1 FROM services WHERE service_id = ? LIMIT 1',
        [service_id]
      );
      if (Array.isArray(dupCheck) && (dupCheck as any[]).length > 0) {
        throw new Error('Generated service_id already exists, please retry');
      }

      // Insert the service record
      const insertQuery = `
        INSERT INTO services (
          service_id, vendor_id, name, description, service_category_id, type, base_price,
          duration_minutes, is_available, service_pincodes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        service_id,
        vendor_id, // Use original vendor_id format (VND001, VND002, etc.)
        name,
        description || '',
        service_category_id || '',
        type || '',
        base_price,
        duration_minutes,
        is_available || 0,
        normalizedPincodes,
      ];
      await connection.execute(insertQuery, params);

      // Track the last assigned (monotonic, but we still fill gaps above)
      await connection.execute(
        'UPDATE id_sequences SET last_assigned = GREATEST(last_assigned, ?) WHERE id_type = ? AND scope = ?',
        [allocatedSequence, idType, vendorPrefix]
      );

      await connection.commit();
      inTransaction = false;

      // Handle pincodes in ServicePincodes table
      console.log('🔍 Checking service_pincodes:', service_pincodes, 'Type:', typeof service_pincodes);
      
      if (typeof service_pincodes === 'string' && service_pincodes.trim().length > 0) {
        try {
          console.log('🔍 Processing pincodes:', service_pincodes);
          
          // Parse all pincodes for ServicePincodes table
          const rawPincodes = service_pincodes.split(',').map(pin => pin.trim());
          console.log('🔍 Raw pincodes after split:', rawPincodes);
          
          const allPincodes = rawPincodes
            .map(pin => pin.replace(/\D/g, ''))
            .filter(pin => pin.length > 0);
          
          console.log('🔍 Pincodes after cleaning:', allPincodes);
          
          // Filter for 6-digit pincodes
          const validPincodes = allPincodes.filter(pin => pin.length === 6);
          console.log('🔍 6-digit pincodes:', validPincodes);
          
          console.log('🔍 Valid pincodes found:', validPincodes);
          console.log('🔍 Number of valid pincodes:', validPincodes.length);

          if (validPincodes.length === 0) {
            console.log('⚠️ No valid 6-digit pincodes found after filtering');
          }

          // Create individual rows for each pincode
          for (let i = 0; i < validPincodes.length; i++) {
            const pincode = validPincodes[i];
            // Generate a unique ID using timestamp + index
            const uniqueId = Date.now() + i;
            
            const insertPincodeQuery = `
              INSERT INTO service_pincodes (id, service_id, service_pincodes)
              VALUES (?, ?, ?)
            `;
            console.log('🔍 Executing query:', insertPincodeQuery, 'with params:', [uniqueId, service_id, pincode]);
            await executeQuery(insertPincodeQuery, [uniqueId, service_id, pincode]);
            console.log(`✅ Added pincode ${pincode} to new service ${service_id} with ID ${uniqueId}`);
          }
        } catch (syncError: any) {
          console.error('❌ Error syncing pincodes for new service:', syncError);
          console.error('❌ Error details:', {
            message: syncError?.message || 'Unknown error',
            code: syncError?.code || 'Unknown code',
            sqlMessage: syncError?.sqlMessage || 'Unknown SQL error'
          });
          // Don't fail the service creation if pincode sync fails
        }
      } else {
        console.log('⚠️ service_pincodes is empty or not a string');
      }

      // Create notification for admin when service is created
      // Get current India/Delhi time
      const indiaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      const currentTimestamp = indiaTime.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');
      const notificationQuery = `
        INSERT INTO notifications (
          type, title, message, for_admin, for_dealer, for_user, for_vendor,
          vendor_id, is_read, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const notificationData = {
        type: 'service_created',
        title: 'New Service Created',
        message: `A new service "${name}" has been created by vendor ${vendor_id}`,
        for_admin: 1,
        for_dealer: 0,
        for_user: 0,
        for_vendor: 0,
        vendor_id: vendor_id,
        is_read: 0,
        metadata: JSON.stringify({
          service_id: service_id,
          vendor_id: vendor_id,
          service_category_id: service_category_id,
          name: name,
          description: description || '',
          type: type,
          base_price: base_price,
          duration_minutes: duration_minutes,
          is_available: is_available || 0,
          service_pincodes: normalizedPincodes || '',

          created_at: currentTimestamp,
          updated_at: currentTimestamp
        })
      };
      const notificationParams = [
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.for_admin,
        notificationData.for_dealer,
        notificationData.for_user,
        notificationData.for_vendor,
        notificationData.vendor_id,
        notificationData.is_read,
        notificationData.metadata,
        currentTimestamp,
        currentTimestamp
      ];
      try {
        await executeQuery(notificationQuery, notificationParams);
        console.log('✅ Notification created for new service:', service_id);
      } catch (notificationError) {
        console.error('❌ Error creating notification:', notificationError);
        // Do not fail the service creation if notification fails
      }

      return NextResponse.json({
        success: true,
        message: 'Service created successfully',
        service_id
      });
    } catch (txError: any) {
      if (inTransaction) {
        try { await (connection as any).rollback(); } catch {}
      }
      throw txError;
    } finally {
      try { await connection.end(); } catch {}
    }

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
