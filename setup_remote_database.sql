-- Vendor Dashboard Database Setup for Remote Database
-- This script will create the necessary tables in your remote database

-- Create Vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS Vendors (
    vendor_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    service_id INT,
    vendor_description TEXT,
    contact_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    business_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    years_in_business INT,
    hourly_rate DECIMAL(10,2),
    service_area_radius DECIMAL(10,2),
    is_certified TINYINT(1) DEFAULT 0,
    certification_details TEXT,
    insurance_coverage VARCHAR(255),
    insurance_details TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    availability VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1
);

-- Insert sample vendor data with password hash
INSERT INTO Vendors (
    vendor_name, 
    business_registration_number, 
    vendor_description, 
    contact_email, 
    password_hash,
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
    average_rating, 
    total_reviews, 
    availability
) VALUES (
    'ABC Cleaning Services',
    'BRN123456789',
    'Professional cleaning services for residential and commercial properties. We specialize in deep cleaning, regular maintenance, and specialized cleaning services.',
    'vendor@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password123
    '+1-555-0123',
    '123 Business Street',
    'New York',
    'NY',
    '10001',
    'USA',
    5,
    45.00,
    25.0,
    1,
    'Certified by Professional Cleaning Institute',
    'General Liability Insurance',
    'Coverage up to $1,000,000',
    4.5,
    127,
    'Weekdays 8AM-6PM, Weekends 9AM-5PM'
) ON DUPLICATE KEY UPDATE vendor_name = vendor_name;

-- Show the created table structure
DESCRIBE Vendors;

-- Show the inserted data
SELECT vendor_id, vendor_name, contact_email, is_active FROM Vendors; 