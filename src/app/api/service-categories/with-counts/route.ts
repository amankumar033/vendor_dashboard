import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch service categories with service counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');

    let query: string;
    let params: any[];

    if (vendor_id) {
      // Get categories for specific vendor
      query = `
        SELECT 
          sc.service_category_id,
          sc.name,
          sc.vendor_id,
          sc.description,
          sc.created_at,
          sc.updated_at,
          COALESCE(COUNT(s.service_id), 0) as service_count
        FROM service_categories sc
        LEFT JOIN services s ON sc.service_category_id = s.service_category_id AND s.vendor_id = sc.vendor_id
        WHERE sc.vendor_id = ?
        GROUP BY sc.service_category_id, sc.name, sc.vendor_id, sc.description, sc.created_at, sc.updated_at
        ORDER BY sc.name ASC
      `;
      params = [vendor_id];
    } else {
      // Get all categories with counts
      query = `
        SELECT 
          sc.service_category_id,
          sc.name,
          sc.vendor_id,
          sc.description,
          sc.created_at,
          sc.updated_at,
          COALESCE(COUNT(s.service_id), 0) as service_count
        FROM service_categories sc
        LEFT JOIN services s ON sc.service_category_id = s.service_category_id
        GROUP BY sc.service_category_id, sc.name, sc.vendor_id, sc.description, sc.created_at, sc.updated_at
        ORDER BY sc.name ASC
      `;
      params = [];
    }

    const categories = await executeQuery(query, params) as any[];

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching service categories with counts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
} 