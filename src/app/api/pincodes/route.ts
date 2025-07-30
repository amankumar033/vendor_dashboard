import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch all pincodes for a specific vendor's services
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
      SELECT sp.id, sp.service_id, sp.pincode, s.name as service_name, s.vendor_id
      FROM service_pincodes sp
      JOIN services s ON sp.service_id = s.service_id
      WHERE s.vendor_id = ?
      ORDER BY s.name, sp.pincode
    `;

    const pincodes = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      pincodes
    });

  } catch (error) {
    console.error('Error fetching pincodes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a new pincode for a service
export async function POST(request: NextRequest) {
  try {
    const { service_id, pincode, vendor_id } = await request.json();

    // Validate required fields
    if (!service_id || !pincode || !vendor_id) {
      return NextResponse.json(
        { error: 'Service ID, pincode, and vendor ID are required' },
        { status: 400 }
      );
    }

    // First check if the service belongs to the vendor
    const serviceCheckQuery = `
      SELECT service_id FROM services 
      WHERE service_id = ? AND vendor_id = ?
    `;
    
    const existingServices = await executeQuery(serviceCheckQuery, [service_id, vendor_id]) as any[];
    
    if (existingServices.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or you do not have permission to add pincodes to it' },
        { status: 404 }
      );
    }

    // Check if pincode already exists for this service
    const checkQuery = `
      SELECT id FROM service_pincodes 
      WHERE service_id = ? AND pincode = ?
    `;
    
    const existing = await executeQuery(checkQuery, [service_id, pincode]) as any[];
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Pincode already exists for this service' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO service_pincodes (service_id, pincode)
      VALUES (?, ?)
    `;

    const result = await executeQuery(insertQuery, [service_id, pincode]) as any;

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Pincode added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding pincode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 