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

async function updatePassword() {
  try {
    console.log('Updating vendor password...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Create a new password hash
    const newPassword = 'password123';
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`\n🔐 Updating password for vendor@gmail.com to: ${newPassword}`);
    
    // Update the password
    const updateQuery = `
      UPDATE vendors 
      SET password_hash = ? 
      WHERE contact_email = ?
    `;
    
    const result = await connection.execute(updateQuery, [newPasswordHash, 'vendor@gmail.com']);
    
    if (result[0].affectedRows > 0) {
      console.log('✅ Password updated successfully!');
      console.log(`\n📋 Login credentials:`);
      console.log(`   Email: vendor@gmail.com`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log('❌ No vendor found with email vendor@gmail.com');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updatePassword(); 