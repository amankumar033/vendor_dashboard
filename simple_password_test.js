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

async function testPassword() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get the vendor data
    const [vendors] = await connection.execute('SELECT vendor_id, vendor_name, contact_email, password_hash FROM Vendors WHERE contact_email = ?', ['vendor@gmail.com']);
    
    if (vendors.length > 0) {
      const vendor = vendors[0];
      console.log('Vendor found:');
      console.log(`  Name: ${vendor.vendor_name}`);
      console.log(`  Email: ${vendor.contact_email}`);
      
      // Test the most likely password
      const testPassword = 'ronaks';
      const isValid = await bcrypt.compare(testPassword, vendor.password_hash);
      
      if (isValid) {
        console.log(`✅ CORRECT PASSWORD: ${testPassword}`);
        console.log('\nYou can now login with:');
        console.log(`Email: ${vendor.contact_email}`);
        console.log(`Password: ${testPassword}`);
      } else {
        console.log(`❌ Password '${testPassword}' is incorrect`);
        console.log('\nPlease provide the correct password for this account.');
      }
      
    } else {
      console.log('No vendor found with email vendor@gmail.com');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPassword(); 