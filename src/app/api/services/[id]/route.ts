import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';



// GET - Fetch a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT service_id, vendor_id, name, description, service_category_id, type, 
             base_price, duration_minutes, is_available, service_pincodes
      FROM services 
      WHERE service_id = ? AND vendor_id = ?
    `;

    const services = await executeQuery(query, [id, vendor_id]) as any[];

    if (services.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service: services[0] });

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service_id = id;
    const {
      vendor_id,
      name,
      description,
      service_category_id,
      type,
      base_price,
      duration_minutes,
      is_available,
      service_pincodes
    } = await request.json();

    // Validate required fields
    if (!vendor_id || !name || !service_category_id || !type || !base_price || !duration_minutes) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // First check if the service belongs to the vendor
    const checkQuery = `
      SELECT service_id FROM services 
      WHERE service_id = ? AND vendor_id = ?
    `;
    
    const existingServices = await executeQuery(checkQuery, [service_id, vendor_id]) as any[];
    
    if (existingServices.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Process pincodes for validation and storage
    let pincodeArray: string[] = [];
    let pincodesString = '';
    
    if (typeof service_pincodes === 'string' && service_pincodes.trim().length > 0) {
      // Split by comma, clean each pincode, and validate
      pincodeArray = service_pincodes.split(',')
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
      
      // Create comma-separated string for services table (limit to 100 chars to be safe)
      pincodesString = pincodeArray.join(', ');
      if (pincodesString.length > 100) {
        // If too long, truncate and add note
        pincodesString = pincodesString.substring(0, 95) + '...';
      }
    }

    const updateQuery = `
      UPDATE services 
      SET name = ?, description = ?, service_category_id = ?, type = ?, 
          base_price = ?, duration_minutes = ?, is_available = ?, service_pincodes = ?
      WHERE service_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [
      name, description, service_category_id, type, base_price,
      duration_minutes, is_available || 1, pincodesString, service_id, vendor_id
    ]);

    // Handle pincodes in ServicePincodes table
    if (typeof service_pincodes === 'string' && service_pincodes.trim().length > 0) {
      try {
        // First, remove all existing pincodes for this service
        const deleteExistingQuery = `
          DELETE FROM service_pincodes 
          WHERE service_id = ?
        `;
        await executeQuery(deleteExistingQuery, [service_id]);
        console.log(`🗑️ Removed existing pincodes for service ${service_id}`);

        // Use the already processed pincodeArray for service_pincodes table
        // Create individual rows for each pincode
        for (let i = 0; i < pincodeArray.length; i++) {
          const pincode = pincodeArray[i];
          // Generate a unique ID using timestamp + index
          const uniqueId = Date.now() + i;
          
          const insertPincodeQuery = `
            INSERT INTO service_pincodes (id, service_id, service_pincodes)
            VALUES (?, ?, ?)
          `;
          await executeQuery(insertPincodeQuery, [uniqueId, service_id, pincode]);
          console.log(`✅ Added pincode ${pincode} to service ${service_id} with ID ${uniqueId}`);
        }
      } catch (syncError) {
        console.error('❌ Error syncing pincodes:', syncError);
        // Don't fail the service update if pincode sync fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully'
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service_id = id;
    const { vendor_id } = await request.json();

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // First check if the service belongs to the vendor
    const checkQuery = `
      SELECT service_id FROM services 
      WHERE service_id = ? AND vendor_id = ?
    `;
    
    const existingServices = await executeQuery(checkQuery, [service_id, vendor_id]) as any[];
    
    if (existingServices.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const deleteQuery = 'DELETE FROM services WHERE service_id = ? AND vendor_id = ?';
    await executeQuery(deleteQuery, [service_id, vendor_id]);

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
