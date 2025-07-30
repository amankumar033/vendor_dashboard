import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Fetch vendor with password hash from database
    const query = `
      SELECT vendor_id, vendor_name, business_registration_number, vendor_description, 
             contact_email, password_hash, contact_phone, business_address, city, 
             state_province, postal_code, country, years_in_business, hourly_rate, 
             service_area_radius, is_certified, certification_details, insurance_coverage, 
             insurance_details, average_rating, total_reviews, availability, is_active, 
             created_at, updated_at
      FROM vendors 
      WHERE contact_email = ?
    `;

    const vendors = await executeQuery(query, [email]) as any[];

    if (vendors.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const vendor = vendors[0];

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, vendor.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        vendor_id: vendor.vendor_id,
        email: vendor.contact_email,
        name: vendor.vendor_name
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    // Return vendor data (without password) and token
    const { password_hash, ...vendorData } = vendor;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      vendor: vendorData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 