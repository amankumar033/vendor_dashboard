import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Profile API - No authorization header or invalid format');
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as any;
    console.log('Profile API - Token verified successfully:', { vendor_id: decoded.vendor_id, email: decoded.email });
    return decoded;
  } catch (error) {
    console.log('Profile API - Token verification failed:', error);
    return null;
  }
}

// GET - Fetch vendor profile
export async function GET(request: NextRequest) {
  try {
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `
      SELECT vendor_id, vendor_name, business_registration_number,
             vendor_description, contact_email, contact_phone, business_address,
             city, state_province, postal_code, country, years_in_business,
             hourly_rate, service_area_radius, is_certified, certification_details,
             insurance_coverage, insurance_details, average_rating, total_reviews,
             availability, is_active, created_at, updated_at
      FROM vendors 
      WHERE vendor_id = ?
    `;

    const vendors = await executeQuery(query, [token.vendor_id]) as any[];

    console.log('Profile API - Token vendor_id:', token.vendor_id);
    console.log('Profile API - Query result:', vendors);

    if (vendors.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ vendor: vendors[0] });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update vendor profile
export async function PUT(request: NextRequest) {
  try {
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      vendor_name,
      business_registration_number,
      vendor_description,
      contact_phone,
      business_address,
      city,
      state_province,
      postal_code,
      country,
      years_in_business,
      hourly_rate,
      service_area_radius,
      is_certified,
      certification_details,
      insurance_coverage,
      insurance_details,
      availability
    } = await request.json();

    const updateQuery = `
      UPDATE vendors 
      SET vendor_name = ?, business_registration_number = ?, vendor_description = ?,
          contact_phone = ?, business_address = ?, city = ?, state_province = ?,
          postal_code = ?, country = ?, years_in_business = ?, hourly_rate = ?,
          service_area_radius = ?, is_certified = ?, certification_details = ?,
          insurance_coverage = ?, insurance_details = ?, availability = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = ?
    `;

    await executeQuery(updateQuery, [
      vendor_name,
      business_registration_number || null,
      vendor_description || null,
      contact_phone,
      business_address,
      city,
      state_province,
      postal_code,
      country,
      years_in_business || null,
      hourly_rate || null,
      service_area_radius || null,
      is_certified !== undefined ? is_certified : null,
      certification_details || null,
      insurance_coverage || null,
      insurance_details || null,
      availability || null,
      token.vendor_id
    ]);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 