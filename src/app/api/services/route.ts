import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

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
        AND s.vendor_id = sc.vendor_id
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

   
    // Get latest SRV id
    const getMaxIdQuery = `
      SELECT MAX(CAST(SUBSTRING(service_id, 4) AS UNSIGNED)) AS maxId 
      FROM services
    `;
    const result = (await executeQuery(getMaxIdQuery)) as any[];
    const lastId = result[0]?.maxId || 0;
    const nextId = lastId + 1;
    const service_id = `SRV${nextId}`;
    console.log('Generated service_id:', service_id);
    
    // ✅ CORRECTED INSERT QUERY WITHOUT is_featured
    const insertQuery = `
      INSERT INTO services (
        service_id, vendor_id, name, description, service_category_id, type, base_price, 
        duration_minutes, is_available, service_pincodes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // ✅ Matching parameter values WITHOUT is_featured
    const params = [
      service_id,
      vendor_id,
      name,
      description || '',
      service_category_id || '',
      type || '',
      base_price,
      duration_minutes,
      is_available || 0, // Default to 0 if not provided
      service_pincodes,
    ];

    await executeQuery(insertQuery, params);

    // Create notification for admin when service is created
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
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
        service_pincodes: service_pincodes || '',
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
      currentTimestamp,  // created_at
      currentTimestamp   // updated_at
    ];

    try {
      await executeQuery(notificationQuery, notificationParams);
      console.log('✅ Notification created for new service:', service_id);
    } catch (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
      // Don't fail the service creation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      service_id
    });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
