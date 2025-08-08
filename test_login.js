const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test login with the vendor credentials from the database
    const email = 'vendor@gmail.com';
    const password = 'password123'; // This is likely the password
    
    console.log(`\n🔐 Testing login for: ${email}`);
    
    // Fetch vendor from database
    const query = `
      SELECT vendor_id, vendor_name, business_registration_number, vendor_description, 
             contact_email, password_hash, contact_phone, business_address, city, 
            postal_code,  years_in_business, 
             is_certified, certification_details,  average_rating, total_reviews, availability, is_active, 
             created_at, updated_at
      FROM vendors 
      WHERE contact_email = ?
    `;

    const vendors = await connection.execute(query, [email]);
    
    if (vendors[0].length === 0) {
      console.log('❌ Vendor not found');
      return;
    }

    const vendor = vendors[0][0];
    console.log('✅ Vendor found:', {
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.vendor_name,
      contact_email: vendor.contact_email,
      is_active: vendor.is_active
    });
    
    // Test password verification
    console.log('\n🔑 Testing password verification...');
    
    // Try common passwords
    const testPasswords = ['password123', '123456', 'password', 'admin', 'test'];
    
    for (const testPassword of testPasswords) {
      try {
        const isPasswordValid = await bcrypt.compare(testPassword, vendor.password_hash);
        if (isPasswordValid) {
          console.log(`✅ Password found: "${testPassword}"`);
          console.log('\n📋 Vendor data that would be returned:');
          const { password_hash, ...vendorData } = vendor;
          console.log(JSON.stringify(vendorData, null, 2));
          break;
        }
      } catch (error) {
        console.log(`❌ Error testing password "${testPassword}":`, error.message);
      }
    }
    
    // Check services for this vendor
    console.log('\n🔍 Checking services for this vendor...');
    const servicesQuery = `
      SELECT service_id, name, category, base_price, is_available
      FROM services 
      WHERE vendor_id = ?
      LIMIT 5
    `;
    const services = await connection.execute(servicesQuery, [vendor.vendor_id]);
    console.log(`Found ${services[0].length} services:`);
    services[0].forEach(service => {
      console.log(`  - ${service.name} (${service.category}) - $${service.base_price}`);
    });
    
    // Check service orders for this vendor
    console.log('\n📦 Checking service orders for this vendor...');
    const ordersQuery = `
      SELECT service_order_id, service_name, service_status, final_price, payment_status
      FROM service_orders 
      WHERE vendor_id = ?
      LIMIT 5
    `;
    const orders = await connection.execute(ordersQuery, [vendor.vendor_id]);
    console.log(`Found ${orders[0].length} service orders:`);
    orders[0].forEach(order => {
      console.log(`  - ${order.service_name} - ${order.service_status} - $${order.final_price}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin(); 