const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
};

async function checkPassword() {
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
      
      // Test password123
      const isValid = await bcrypt.compare('password123', vendor.password_hash);
      console.log(`Password 'password123' is valid: ${isValid}`);
      
      // Test common passwords
      const testPasswords = ['password', '123456', 'admin', 'test', 'password123'];
      for (const pwd of testPasswords) {
        const valid = await bcrypt.compare(pwd, vendor.password_hash);
        if (valid) {
          console.log(`✅ Password found: ${pwd}`);
        }
      }
      
    } else {
      console.log('No vendor found with email vendor@gmail.com');
      
      // Show all vendors
      const [allVendors] = await connection.execute('SELECT vendor_id, vendor_name, contact_email FROM Vendors');
      console.log('Available vendors:');
      allVendors.forEach(v => {
        console.log(`  - ${v.vendor_name} (${v.contact_email})`);
      });
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPassword(); 