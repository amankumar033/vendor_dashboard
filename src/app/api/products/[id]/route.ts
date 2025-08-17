import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      WHERE product_id = ? AND vendor_id = ?
    `;

    const products = await executeQuery(query, [id, vendor_id]) as any[];

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product_id = id;
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

    // First check if the product belongs to the vendor
    const checkQuery = `
      SELECT product_id FROM products 
      WHERE product_id = ? AND vendor_id = ?
    `;
    
    const existingProducts = await executeQuery(checkQuery, [product_id, vendor_id]) as any[];
    
    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE products 
      SET name = ?, description = ?, category = ?, price = ?, 
          stock_quantity = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [
      name, description, category, price,
      stock_quantity, is_available || true, product_id, vendor_id
    ]);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product_id = id;
    const { vendor_id } = await request.json();

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // First check if the product belongs to the vendor
    const checkQuery = `
      SELECT product_id FROM products 
      WHERE product_id = ? AND vendor_id = ?
    `;
    
    const existingProducts = await executeQuery(checkQuery, [product_id, vendor_id]) as any[];
    
    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const deleteQuery = 'DELETE FROM products WHERE product_id = ? AND vendor_id = ?';
    await executeQuery(deleteQuery, [product_id, vendor_id]);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 