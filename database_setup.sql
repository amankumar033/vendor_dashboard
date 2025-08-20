-- Vendor Dashboard Database Setup
-- Run this script in your MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS vendor_dashboard;
USE vendor_dashboard;

-- Create Services table
CREATE TABLE IF NOT EXISTS Services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    service_pincodes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_category (category),
    INDEX idx_is_available (is_available)
);

-- Create Vendors table
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

-- Create ServicePincodes table
CREATE TABLE IF NOT EXISTS ServicePincodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
    UNIQUE KEY unique_service_pincode (service_id, pincode),
    INDEX idx_service_id (service_id),
    INDEX idx_pincode (pincode)
);

-- Create ServiceOrders table
CREATE TABLE IF NOT EXISTS ServiceOrders (
    service_order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    vendor_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    service_description TEXT,
    service_category VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    service_status VARCHAR(20) DEFAULT 'Scheduled',
    service_pincode VARCHAR(10) NOT NULL,
    service_address TEXT NOT NULL,
    additional_notes TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    was_available TINYINT(1) NOT NULL DEFAULT 1,
    is_available TINYINT(1) GENERATED ALWAYS AS (was_available) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_service_id (service_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_service_date (service_date),
    INDEX idx_service_status (service_status),
    INDEX idx_service_pincode (service_pincode)
);

-- Insert sample vendor data
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
);

-- Insert sample services
INSERT INTO Services (
    vendor_id,
    name,
    description,
    category,
    type,
    base_price,
    duration_minutes,
    is_available,
    service_pincodes
) VALUES 
(1, 'Regular House Cleaning', 'Standard house cleaning service including dusting, vacuuming, and bathroom cleaning', 'Cleaning', 'Residential', 80.00, 120, 1, '10001,10002,10003'),
(1, 'Deep Cleaning', 'Comprehensive deep cleaning service for move-in/move-out or special occasions', 'Cleaning', 'Residential', 150.00, 240, 1, '10001,10002,10003,10004'),
(1, 'Office Cleaning', 'Professional office cleaning service for commercial spaces', 'Cleaning', 'Commercial', 120.00, 180, 1, '10001,10002,10005'),
(1, 'Carpet Cleaning', 'Professional carpet cleaning and stain removal service', 'Cleaning', 'Specialized', 100.00, 90, 1, '10001,10002,10003');

-- Insert sample orders
INSERT INTO ServiceOrders (
    user_id,
    service_id,
    vendor_id,
    service_name,
    service_description,
    service_category,
    service_type,
    base_price,
    final_price,
    duration_minutes,
    booking_date,
    service_date,
    service_time,
    service_status,
    service_pincode,
    service_address,
    additional_notes,
    payment_method,
    payment_status
) VALUES 
(1, 1, 1, 'Regular House Cleaning', 'Standard house cleaning service including dusting, vacuuming, and bathroom cleaning', 'Cleaning', 'Residential', 80.00, 80.00, 120, '2024-01-15 10:00:00', '2024-01-20', '14:00:00', 'Scheduled', '10001', '456 Main Street, New York, NY 10001', 'Please focus on kitchen and bathrooms', 'Credit Card', 'Paid'),
(2, 2, 1, 'Deep Cleaning', 'Comprehensive deep cleaning service for move-in/move-out or special occasions', 'Cleaning', 'Residential', 150.00, 150.00, 240, '2024-01-16 09:00:00', '2024-01-22', '10:00:00', 'In Progress', '10002', '789 Oak Avenue, New York, NY 10002', 'Moving out cleaning required', 'Credit Card', 'Paid'),
(3, 3, 1, 'Office Cleaning', 'Professional office cleaning service for commercial spaces', 'Cleaning', 'Commercial', 120.00, 120.00, 180, '2024-01-14 16:00:00', '2024-01-18', '18:00:00', 'Completed', '10001', '321 Business Plaza, New York, NY 10001', 'After hours cleaning preferred', 'Credit Card', 'Paid'),
(4, 4, 1, 'Carpet Cleaning', 'Professional carpet cleaning and stain removal service', 'Cleaning', 'Specialized', 100.00, 100.00, 90, '2024-01-17 11:00:00', '2024-01-25', '15:00:00', 'Scheduled', '10003', '654 Pine Street, New York, NY 10003', 'Pet stains need special attention', 'Credit Card', 'Pending');

-- Insert sample service pincodes
INSERT INTO ServicePincodes (service_id, pincode) VALUES 
(1, '10001'),
(1, '10002'),
(1, '10003'),
(2, '10001'),
(2, '10002'),
(2, '10003'),
(2, '10004'),
(3, '10001'),
(3, '10002'),
(3, '10005'),
(4, '10001'),
(4, '10002'),
(4, '10003'); 