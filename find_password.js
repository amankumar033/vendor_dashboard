const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
};

async function findPassword() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get the vendor data
    const [vendors] = await connection.execute('SELECT vendor_id, vendor_name, contact_email, password_hash FROM Vendors WHERE contact_email = ?', ['vendor@gmail.com']);
    
    if (vendors.length > 0) {
      const vendor = vendors[0];
      console.log('Vendor found:');
      console.log(`  Name: ${vendor.vendor_name}`);
      console.log(`  Email: ${vendor.contact_email}`);
      console.log(`  Password Hash: ${vendor.password_hash}`);
      
      // Test common passwords
      const testPasswords = [
        'password', '123456', 'admin', 'test', 'password123',
        'ronaks', 'ronak', '123', '1234', '12345', '123456789',
        'qwerty', 'abc123', 'password1', 'admin123', 'user',
        'kriptocar', 'kripto', 'car', 'test123', 'demo'
      ];
      
      console.log('\nTesting passwords...');
      for (const pwd of testPasswords) {
        const valid = await bcrypt.compare(pwd, vendor.password_hash);
        if (valid) {
          console.log(`✅ CORRECT PASSWORD FOUND: ${pwd}`);
          break;
        }
      }
      
    } else {
      console.log('No vendor found with email vendor@gmail.com');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findPassword(); 