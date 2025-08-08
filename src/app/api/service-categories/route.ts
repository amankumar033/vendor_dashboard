import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch all service categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');

    let query: string;
    let params: any[];

    if (vendor_id) {
      // Get categories for specific vendor
      query = `
        SELECT service_category_id, name, vendor_id, description, created_at, updated_at
        FROM service_categories 
        WHERE vendor_id = ?
        ORDER BY name ASC
      `;
      params = [vendor_id];
    } else {
      // Get all categories
      query = `
        SELECT service_category_id, name, vendor_id, description, created_at, updated_at
        FROM service_categories 
        ORDER BY name ASC
      `;
      params = [];
    }

    const categories = await executeQuery(query, params) as any[];

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new service category
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      vendor_id,
      description
    } = await request.json();

    if (!name || !vendor_id) {
      return NextResponse.json(
        { error: 'Name and vendor_id are required' },
        { status: 400 }
      );
    }

    // Generate category ID
    const getMaxIdQuery = `
      SELECT MAX(CAST(SUBSTRING(service_category_id, 5) AS UNSIGNED)) AS maxId 
      FROM service_categories
    `;
    const result = (await executeQuery(getMaxIdQuery)) as any[];
    const lastId = result[0]?.maxId || 0;
    const nextId = lastId + 1;
    const service_category_id = `SCTR${nextId}`;

    const insertQuery = `
      INSERT INTO service_categories (
        service_category_id, name, vendor_id, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      service_category_id,
      name,
      vendor_id,
      description || ''
    ];

    await executeQuery(insertQuery, params);

    return NextResponse.json(
      {
        success: true,
        service_category_id,
        message: 'Service category created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating service category:', error);
    return NextResponse.json(
      { error: 'Failed to create service category' },
      { status: 500 }
    );
  }
} 