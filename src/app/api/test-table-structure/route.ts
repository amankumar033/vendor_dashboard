import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check the structure of service_pincodes table
    const describeQuery = 'DESCRIBE service_pincodes';
    const tableStructure = await executeQuery(describeQuery, []) as any[];
    
    // Also try to get a sample of data
    const sampleQuery = 'SELECT * FROM service_pincodes LIMIT 5';
    let sampleData;
    try {
      sampleData = await executeQuery(sampleQuery, []) as any[];
    } catch (error: any) {
      sampleData = { error: error?.message || 'Unknown error' };
    }
    
    return NextResponse.json({
      success: true,
      tableStructure,
      sampleData,
      message: 'Table structure retrieved successfully'
    });
    
  } catch (error: any) {
    console.error('Error checking table structure:', error);
    return NextResponse.json({
      error: 'Failed to check table structure',
      details: error.message
    }, { status: 500 });
  }
}
