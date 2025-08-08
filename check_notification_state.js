const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function checkNotificationState() {
  try {
    console.log('Checking notification state in database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Check all notifications for VND1
    console.log('\n1. Checking all notifications for VND1...');
    const [notifications] = await connection.execute(`
      SELECT id, type, title, message, for_vendor, is_read, created_at
      FROM notifications 
      WHERE vendor_id = 'VND1'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log('All notifications for VND1:', JSON.stringify(notifications, null, 2));
    
    // Count notifications by for_vendor status
    console.log('\n2. Counting notifications by for_vendor status...');
    const [counts] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN for_vendor = 1 THEN 1 END) as visible_to_vendor,
        COUNT(CASE WHEN for_vendor = 0 THEN 1 END) as hidden_from_vendor
      FROM notifications 
      WHERE vendor_id = 'VND1'
    `);
    console.log('Notification counts:', JSON.stringify(counts, null, 2));
    
    // Check if notification with ID 59 exists
    console.log('\n3. Checking for notification ID 59...');
    const [notification59] = await connection.execute(`
      SELECT id, type, title, message, for_vendor, is_read, created_at
      FROM notifications 
      WHERE id = 59
    `);
    console.log('Notification ID 59:', JSON.stringify(notification59, null, 2));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNotificationState(); 