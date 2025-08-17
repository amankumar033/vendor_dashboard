const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vendor_dashboard'
};

async function testDatabaseFixes() {
  let connection;
  
  try {
    console.log('🔍 Testing database fixes...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Test 1: Check if service_orders table exists and has correct columns
    console.log('\n📋 Test 1: Checking service_orders table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE service_orders
    `);
    
    const hasServiceStatus = columns.some(col => col.Field === 'service_status');
    const hasStatus = columns.some(col => col.Field === 'status');
    
    console.log('✅ ServiceOrders table exists');
    console.log(`✅ Has service_status column: ${hasServiceStatus}`);
    console.log(`❌ Has status column: ${hasStatus}`);
    
    if (!hasServiceStatus) {
      console.error('❌ ERROR: service_status column not found!');
      return;
    }
    
    // Test 2: Try to update a service order status
    console.log('\n📝 Test 2: Testing service order status update...');
    
    // First, get a sample service order
    const [orders] = await connection.execute(`
      SELECT service_order_id, service_status 
      FROM service_orders 
      LIMIT 1
    `);
    
    if (orders.length === 0) {
      console.log('⚠️  No service orders found in database');
      console.log('   Creating a test service order...');
      
      // Create a test service order
      await connection.execute(`
        INSERT INTO service_orders (
          user_id, service_id, vendor_id, service_name, service_description,
          service_category, service_type, base_price, final_price, duration_minutes,
          booking_date, service_date, service_time, service_status, service_pincode,
          service_address, payment_status
        ) VALUES (
          1, 1, 1, 'Test Service', 'Test Description',
          'Test Category', 'Test Type', 100.00, 100.00, 60,
          NOW(), '2024-12-25', '10:00:00', 'pending', '12345',
          'Test Address', 'pending'
        )
      `);
      
      console.log('✅ Test service order created');
    }
    
    // Now try to update the status
    const [updateResult] = await connection.execute(`
      UPDATE service_orders 
      SET service_status = 'confirmed', 
          updated_at = NOW()
      WHERE service_order_id = 1
    `);
    
    console.log('✅ Service order status update successful');
    
    // Test 3: Verify the update
    const [updatedOrder] = await connection.execute(`
      SELECT service_order_id, service_status 
      FROM service_orders 
      WHERE service_order_id = 1
    `);
    
    if (updatedOrder.length > 0) {
      console.log(`✅ Status updated to: ${updatedOrder[0].service_status}`);
    }
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the tests
testDatabaseFixes();
