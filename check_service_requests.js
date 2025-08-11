const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function checkServiceRequests() {
  try {
    console.log('Checking service requests in database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Check all notifications for VND1
    console.log('\n1. Checking all notifications for VND1...');
    const [allNotifications] = await connection.execute(`
      SELECT id, type, title, message, for_vendor, vendor_id, is_read, created_at
      FROM notifications 
      WHERE vendor_id = 'VND1'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log('All notifications for VND1:', JSON.stringify(allNotifications, null, 2));
    
    // Check specifically for service_order_created
    console.log('\n2. Checking for service_order_created notifications...');
    const [serviceRequests] = await connection.execute(`
      SELECT id, type, title, message, for_vendor, vendor_id, is_read, created_at
      FROM notifications 
      WHERE vendor_id = 'VND1' AND type = 'service_order_created'
      ORDER BY created_at DESC
    `);
    console.log('Service order created notifications:', JSON.stringify(serviceRequests, null, 2));
    
    // Check notification types
    console.log('\n3. Checking all notification types...');
    const [types] = await connection.execute(`
      SELECT DISTINCT type, COUNT(*) as count
      FROM notifications 
      WHERE vendor_id = 'VND1'
      GROUP BY type
    `);
    console.log('Notification types:', JSON.stringify(types, null, 2));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkServiceRequests();


