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
      SELECT service_id, vendor_id, name, description, category, type, 
             base_price, duration_minutes, is_available, service_pincodes
      FROM services 
      WHERE vendor_id = ?
      ORDER BY service_id DESC
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