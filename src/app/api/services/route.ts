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
      SELECT service_id, vendor_id, name, description, category, type, 
             base_price, duration_minutes, is_available, service_pincodes,
             created_at, updated_at
      FROM services 
      WHERE vendor_id = ?
      ORDER BY created_at DESC
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
      category,
      type,
      base_price,
      duration_minutes,
      is_available,
      service_pincodes,
    } = await request.json();

    if (!vendor_id || !name || !category || !type || !base_price || !duration_minutes) {
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
    // ✅ CORRECTED INSERT QUERY WITH service_id
    const insertQuery = `
      INSERT INTO services (
        service_id, vendor_id, name, description, category, type, base_price, 
        duration_minutes, is_available, service_pincodes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // ✅ Matching parameter values
    const params = [
      service_id,
      vendor_id,
      name,
      description || '',
      category || '',
      type || '',
      base_price,
      duration_minutes,
      is_available,
      service_pincodes,
    ];

    console.log('Insert query:', insertQuery);
    console.log('Params:', params);

    await executeQuery(insertQuery, params);

    return NextResponse.json(
      {
        success: true,
        service_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
