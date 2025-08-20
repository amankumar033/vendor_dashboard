import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // This endpoint will alter the service_pincodes column to increase its size
    const alterQuery = `
      ALTER TABLE services 
      MODIFY COLUMN service_pincodes VARCHAR(500)
    `;

    await executeQuery(alterQuery, []);
    
    console.log('✅ Successfully altered service_pincodes column to VARCHAR(500)');

    return NextResponse.json({
      success: true,
      message: 'Column size updated successfully to VARCHAR(500)'
    });

  } catch (error) {
    console.error('Error altering column:', error);
    return NextResponse.json(
      { error: 'Failed to alter column size' },
      { status: 500 }
    );
  }
}
