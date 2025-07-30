import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch recent service orders for a specific vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');
    const limit = searchParams.get('limit') || '5';

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT service_order_id, user_id, service_id, vendor_id, service_name,
             service_description, service_category, service_type, base_price,
             final_price, duration_minutes, booking_date, service_date,
             service_time, service_status, service_pincode, service_address,
             additional_notes, payment_method, payment_status, transaction_id,
             was_available
      FROM service_orders 
      WHERE vendor_id = ?
      ORDER BY booking_date DESC
      LIMIT ?
    `;

    const recentServiceOrders = await executeQuery(query, [vendor_id, parseInt(limit)]) as any[];

    return NextResponse.json({
      success: true,
      recentServiceOrders
    });

  } catch (error) {
    console.error('Error fetching recent service orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 