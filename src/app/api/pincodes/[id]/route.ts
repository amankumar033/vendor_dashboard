import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// PUT - Update a pincode
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pincode_id = id;
    const { pincode, vendor_id } = await request.json();
    const normalized = String(pincode || '').replace(/\D/g, '').slice(0, 6);

    if (!normalized || !vendor_id) {
      return NextResponse.json(
        { error: 'Pincode and vendor ID are required' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(normalized)) {
      return NextResponse.json(
        { error: 'Invalid pincode. Only a single 6-digit pincode is allowed' },
        { status: 400 }
      );
    }

    // First check if the pincode belongs to a service owned by the vendor
    const checkQuery = `
      SELECT sp.id FROM service_pincodes sp
      JOIN services s ON sp.service_id = s.service_id
      WHERE sp.id = ? AND s.vendor_id = ?
    `;
    
    const existingPincodes = await executeQuery(checkQuery, [pincode_id, vendor_id]) as any[];
    
    if (existingPincodes.length === 0) {
      return NextResponse.json(
        { error: 'Pincode not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Check if pincode already exists for the same service
    const duplicateQuery = `
      SELECT sp.id FROM service_pincodes sp
      JOIN services s ON sp.service_id = s.service_id
      WHERE sp.service_pincodes = ? AND sp.id != ? AND s.vendor_id = ?
    `;
    
    const duplicates = await executeQuery(duplicateQuery, [normalized, pincode_id, vendor_id]) as any[];
    
    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: 'Pincode already exists for this service' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE service_pincodes 
      SET service_pincodes = ?
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [normalized, pincode_id]);

    return NextResponse.json({
      success: true,
      message: 'Pincode updated successfully'
    });

  } catch (error) {
    console.error('Error updating pincode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a pincode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pincode_id = id;
    const { vendor_id } = await request.json();

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // First check if the pincode belongs to a service owned by the vendor
    const checkQuery = `
      SELECT sp.id FROM service_pincodes sp
      JOIN services s ON sp.service_id = s.service_id
      WHERE sp.id = ? AND s.vendor_id = ?
    `;
    
    const existingPincodes = await executeQuery(checkQuery, [pincode_id, vendor_id]) as any[];
    
    if (existingPincodes.length === 0) {
      return NextResponse.json(
        { error: 'Pincode not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const deleteQuery = 'DELETE FROM service_pincodes WHERE id = ?';
    await executeQuery(deleteQuery, [pincode_id]);

    return NextResponse.json({
      success: true,
      message: 'Pincode deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pincode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 