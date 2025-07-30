import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// PUT - Update a service order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service_order_id = params.id;
    const {
      vendor_id,
      service_status,
      payment_status,
      additional_notes
    } = await request.json();

    // Validate required fields
    if (!vendor_id || !service_status || !payment_status) {
      return NextResponse.json(
        { error: 'Vendor ID, service status, and payment status are required' },
        { status: 400 }
      );
    }

    // First check if the service order belongs to the vendor
    const checkQuery = `
      SELECT service_order_id FROM service_orders 
      WHERE service_order_id = ? AND vendor_id = ?
    `;
    
    const existingOrders = await executeQuery(checkQuery, [service_order_id, vendor_id]) as any[];
    
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Service order not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE service_orders 
      SET service_status = ?, payment_status = ?, additional_notes = ?
      WHERE service_order_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [
      service_status, payment_status, additional_notes || '', service_order_id, vendor_id
    ]);

    return NextResponse.json({
      success: true,
      message: 'Service order updated successfully'
    });

  } catch (error) {
    console.error('Error updating service order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service_order_id = params.id;
    const { vendor_id } = await request.json();

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // First check if the service order belongs to the vendor
    const checkQuery = `
      SELECT service_order_id FROM service_orders 
      WHERE service_order_id = ? AND vendor_id = ?
    `;
    
    const existingOrders = await executeQuery(checkQuery, [service_order_id, vendor_id]) as any[];
    
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Service order not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const deleteQuery = 'DELETE FROM service_orders WHERE service_order_id = ? AND vendor_id = ?';
    await executeQuery(deleteQuery, [service_order_id, vendor_id]);

    return NextResponse.json({
      success: true,
      message: 'Service order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 