import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch recent services for a specific vendor
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
      SELECT s.service_id, s.vendor_id, s.name, s.description, s.service_category_id, 
             sc.name as category_name, s.type, s.base_price, s.duration_minutes, 
             s.is_available, s.service_pincodes
      FROM services s
      LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id 
        AND s.vendor_id = sc.vendor_id
      WHERE s.vendor_id = ?
      ORDER BY s.service_id DESC
      LIMIT ${limit}
    `;

    const recentServices = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      recentServices
    });

  } catch (error) {
    console.error('Error fetching recent services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 