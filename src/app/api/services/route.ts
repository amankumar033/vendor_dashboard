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
      service_pincodes
    } = await request.json();

    // Validate required fields
    if (!vendor_id || !name || !category || !type || !base_price || !duration_minutes) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO services (
        vendor_id, name, description, category, type, base_price, 
        duration_minutes, is_available, service_pincodes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      vendor_id, name, description, category, type, base_price,
      duration_minutes, is_available || 1, service_pincodes || ''
    ]) as any;

    return NextResponse.json({
      success: true,
      service_id: result.insertId,
      message: 'Service created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 