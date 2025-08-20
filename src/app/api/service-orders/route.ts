import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch all service orders for a specific vendor
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
      SELECT so.service_order_id, so.user_id, so.service_id, so.vendor_id, so.service_name,
             so.service_description, so.service_category, so.service_type, so.base_price,
             so.final_price, so.duration_minutes, so.booking_date, so.service_date,
             so.service_time, so.service_status, so.service_pincode, so.service_address,
             so.additional_notes, so.payment_method, so.payment_status, so.transaction_id,
             so.was_available,
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM service_orders so
      LEFT JOIN users u ON so.user_id = u.user_id
      WHERE so.vendor_id = ?
      ORDER BY so.booking_date DESC
    `;

    const serviceOrders = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      serviceOrders
    });

  } catch (error) {
    console.error('Error fetching service orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 