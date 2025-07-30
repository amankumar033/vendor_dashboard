const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
  reconnect: true,
};

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test query to check if Vendors table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "Vendors"');
    if (tables.length > 0) {
      console.log('✅ Vendors table exists');
      
      // Check table structure
      const [columns] = await connection.execute('DESCRIBE Vendors');
      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
      
      // Check if password_hash column exists
      const hasPasswordHash = columns.some(col => col.Field === 'password_hash');
      if (hasPasswordHash) {
        console.log('✅ password_hash column exists');
      } else {
        console.log('❌ password_hash column missing');
      }
      
      // Check for existing data
      const [vendors] = await connection.execute('SELECT vendor_id, vendor_name, contact_email, is_active FROM Vendors LIMIT 5');
      console.log(`Found ${vendors.length} vendors in database:`);
      vendors.forEach(vendor => {
        console.log(`  - ${vendor.vendor_name} (${vendor.contact_email}) - Active: ${vendor.is_active}`);
      });
      
    } else {
      console.log('❌ Vendors table does not exist');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection(); 