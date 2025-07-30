import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order_id = params.id;
    const { service_status, vendor_id } = await request.json();

    if (!service_status || !vendor_id) {
      return NextResponse.json(
        { error: 'Service status and vendor ID are required' },
        { status: 400 }
      );
    }

    // First check if the order belongs to the vendor
    const checkQuery = `
      SELECT service_order_id FROM service_orders 
      WHERE service_order_id = ? AND vendor_id = ?
    `;
    
    const existingOrders = await executeQuery(checkQuery, [order_id, vendor_id]) as any[];
    
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE service_orders 
      SET service_status = ?
      WHERE service_order_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [service_status, order_id, vendor_id]);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 