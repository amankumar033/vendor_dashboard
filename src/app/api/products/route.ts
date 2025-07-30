import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch all products for a specific vendor
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
      SELECT product_id, vendor_id, name, description, category, price, 
             stock_quantity, is_available, created_at, updated_at
      FROM products 
      WHERE vendor_id = ?
      ORDER BY created_at DESC
    `;

    const products = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const {
      vendor_id,
      name,
      description,
      category,
      price,
      stock_quantity,
      is_available
    } = await request.json();

    // Validate required fields
    if (!vendor_id || !name || !category || !price || !stock_quantity) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO products (
        vendor_id, name, description, category, price, 
        stock_quantity, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      vendor_id, name, description, category, price,
      stock_quantity, is_available || true
    ]) as any;

    return NextResponse.json({
      success: true,
      product_id: result.insertId,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 