const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function checkVendors() {
  try {
    console.log('Checking vendor credentials...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Check vendors table
    console.log('\n1. Checking vendors table...');
    const [vendors] = await connection.execute(`
      SELECT vendor_id, vendor_name, contact_email, is_active
      FROM vendors 
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log('Vendors found:', JSON.stringify(vendors, null, 2));
    
    // Check if there are any active vendors
    const activeVendors = vendors.filter(v => v.is_active);
    console.log('\n2. Active vendors:', activeVendors.length);
    
    if (activeVendors.length > 0) {
      console.log('\n3. You can log in with any of these vendors:');
      activeVendors.forEach((vendor, index) => {
        console.log(`${index + 1}. Email: ${vendor.contact_email}`);
        console.log(`   Vendor ID: ${vendor.vendor_id}`);
        console.log(`   Name: ${vendor.vendor_name}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No active vendors found!');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVendors();


