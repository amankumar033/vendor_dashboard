import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const {
      vendor_name,
      contact_email,
      password,
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

    // Validate required fields
    if (!vendor_name || !contact_email || !password || !contact_phone || !business_address || !city || !state_province || !postal_code || !country) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if vendor already exists
    const checkQuery = 'SELECT vendor_id FROM vendors WHERE contact_email = ?';
    const existingVendors = await executeQuery(checkQuery, [contact_email]) as any[];

    if (existingVendors.length > 0) {
      return NextResponse.json(
        { error: 'Vendor with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new vendor
    const insertQuery = `
      INSERT INTO vendors (
        vendor_name, contact_email, password_hash, contact_phone,
        business_address, city, state_province, postal_code, country,
        years_in_business, hourly_rate, service_area_radius,
        is_certified, certification_details, insurance_coverage,
        insurance_details, availability
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      vendor_name, contact_email, password_hash, contact_phone,
      business_address, city, state_province, postal_code, country,
      years_in_business || null, hourly_rate || null, service_area_radius || null,
      is_certified || false, certification_details || null, insurance_coverage || null,
      insurance_details || null, availability || null
    ]) as any;

    const vendor_id = result.insertId;

    // Create JWT token
    const token = jwt.sign(
      { 
        vendor_id: vendor_id,
        email: contact_email,
        name: vendor_name
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      vendor: {
        vendor_id: vendor_id,
        vendor_name,
        contact_email,
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
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 