const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vendor_dashboard'
};

async function createTestServiceRequest() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test data for service request notification
    const testNotification = {
      type: 'service_order_created',
      title: 'New Service Request',
      message: 'New service request for "Premium Car Detailing"',
      description: 'A customer has requested your Premium Car Detailing service. The service is scheduled for 2024-01-15 at 10:00 AM. Please review the request details and accept or reject accordingly.',
      for_vendor: 1,
      vendor_id: 'V001', // Replace with actual vendor ID
      is_read: 0,
      metadata: JSON.stringify({
        service_order_id: 'SO001',
        service_name: 'Premium Car Detailing',
        service_category: 'Automotive',
        service_type: 'Detailing',
        base_price: 150.00,
        duration_minutes: 120,
        service_date: '2024-01-15',
        service_time: '10:00 AM',
        service_address: '123 Main Street, City, State 12345',
        user_name: 'John Doe',
        user_email: 'john.doe@example.com'
      })
    };

    // Insert the test notification
    const insertQuery = `
      INSERT INTO notifications (
        type, title, message, description, for_vendor, vendor_id, 
        is_read, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await connection.execute(insertQuery, [
      testNotification.type,
      testNotification.title,
      testNotification.message,
      testNotification.description,
      testNotification.for_vendor,
      testNotification.vendor_id,
      testNotification.is_read,
      testNotification.metadata
    ]);

    console.log('✅ Test service request notification created successfully');
    console.log('📋 Notification ID:', result.insertId);

    // Also create a corresponding service order record
    const serviceOrderData = {
      service_order_id: 'SO001',
      user_id: 'U001',
      service_id: 'S001',
      vendor_id: 'V001',
      service_name: 'Premium Car Detailing',
      service_description: 'Complete car detailing service including interior and exterior cleaning',
      service_category: 'Automotive',
      service_type: 'Detailing',
      base_price: 150.00,
      final_price: 150.00,
      duration_minutes: 120,
      booking_date: '2024-01-10',
      service_date: '2024-01-15',
      service_time: '10:00 AM',
      service_status: 'pending',
      service_pincode: '12345',
      service_address: '123 Main Street, City, State 12345',
      additional_notes: 'Customer prefers eco-friendly cleaning products',
      payment_method: 'online',
      payment_status: 'pending',
      transaction_id: 'TXN001',
      was_available: 1
    };

    const serviceOrderQuery = `
      INSERT INTO service_orders (
        service_order_id, user_id, service_id, vendor_id, service_name,
        service_description, service_category, service_type, base_price,
        final_price, duration_minutes, booking_date, service_date,
        service_time, service_status, service_pincode, service_address,
        additional_notes, payment_method, payment_status, transaction_id,
        was_available, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await connection.execute(serviceOrderQuery, [
      serviceOrderData.service_order_id,
      serviceOrderData.user_id,
      serviceOrderData.service_id,
      serviceOrderData.vendor_id,
      serviceOrderData.service_name,
      serviceOrderData.service_description,
      serviceOrderData.service_category,
      serviceOrderData.service_type,
      serviceOrderData.base_price,
      serviceOrderData.final_price,
      serviceOrderData.duration_minutes,
      serviceOrderData.booking_date,
      serviceOrderData.service_date,
      serviceOrderData.service_time,
      serviceOrderData.service_status,
      serviceOrderData.service_pincode,
      serviceOrderData.service_address,
      serviceOrderData.additional_notes,
      serviceOrderData.payment_method,
      serviceOrderData.payment_status,
      serviceOrderData.transaction_id,
      serviceOrderData.was_available
    ]);

    console.log('✅ Test service order created successfully');
    console.log('🎯 Test Setup Complete!');

  } catch (error) {
    console.error('❌ Error creating test service request:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
createTestServiceRequest();
