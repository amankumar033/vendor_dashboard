import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch dashboard statistics for a vendor
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

    // Get total services
    const servicesQuery = `
      SELECT COUNT(*) as totalServices
      FROM services 
      WHERE vendor_id = ?
    `;
    const servicesResult = await executeQuery(servicesQuery, [vendor_id]) as any[];

    // Get total service orders
    const ordersQuery = `
      SELECT COUNT(*) as totalOrders
      FROM service_orders 
      WHERE vendor_id = ?
    `;
    const ordersResult = await executeQuery(ordersQuery, [vendor_id]) as any[];

    // Get completed orders
    const completedQuery = `
      SELECT COUNT(*) as completedOrders
      FROM service_orders 
      WHERE vendor_id = ? AND service_status = 'completed'
    `;
    const completedResult = await executeQuery(completedQuery, [vendor_id]) as any[];

    // Get pending orders
    const pendingQuery = `
      SELECT COUNT(*) as pendingOrders
      FROM service_orders 
      WHERE vendor_id = ? AND service_status IN ('pending', 'confirmed', 'in_progress')
    `;
    const pendingResult = await executeQuery(pendingQuery, [vendor_id]) as any[];

    // Get total revenue
    const revenueQuery = `
      SELECT COALESCE(SUM(final_price), 0) as totalRevenue
      FROM service_orders 
      WHERE vendor_id = ? AND payment_status = 'paid'
    `;
    const revenueResult = await executeQuery(revenueQuery, [vendor_id]) as any[];

    const stats = {
      totalServices: servicesResult[0]?.totalServices || 0,
      totalOrders: ordersResult[0]?.totalOrders || 0,
      completedOrders: completedResult[0]?.completedOrders || 0,
      pendingOrders: pendingResult[0]?.pendingOrders || 0,
      totalRevenue: revenueResult[0]?.totalRevenue || 0
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 