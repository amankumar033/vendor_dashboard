import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
             base_price, duration_minutes, is_available, service_pincodes
      FROM services 
      WHERE service_id = ? AND vendor_id = ?
    `;

    const services = await executeQuery(query, [params.id, vendor_id]) as any[];

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
  { params }: { params: { id: string } }
) {
  try {
    const service_id = params.id;
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

    const updateQuery = `
      UPDATE services 
      SET name = ?, description = ?, category = ?, type = ?, 
          base_price = ?, duration_minutes = ?, is_available = ?, 
          service_pincodes = ?
      WHERE service_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [
      name, description, category, type, base_price,
      duration_minutes, is_available || 1, service_pincodes || '', service_id, vendor_id
    ]);

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
  { params }: { params: { id: string } }
) {
  try {
    const service_id = params.id;
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