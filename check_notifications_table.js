const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function checkNotificationsTable() {
  try {
    console.log('Checking notifications table structure...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Check table structure
    const describeQuery = 'DESCRIBE notifications';
    const [columns] = await connection.execute(describeQuery);
    
    console.log('\n📋 Notifications table structure:');
    columns.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    // Check existing notification types
    const typesQuery = 'SELECT DISTINCT type FROM notifications ORDER BY type';
    const [types] = await connection.execute(typesQuery);
    
    console.log('\n🔍 Existing notification types:');
    types.forEach(type => {
      console.log(`   - ${type.type}`);
    });
    
    // Check if there are any constraints on the type column
    const constraintsQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'kriptocar' 
      AND TABLE_NAME = 'notifications' 
      AND COLUMN_NAME = 'type'
    `;
    
    const [constraints] = await connection.execute(constraintsQuery);
    if (constraints.length > 0) {
      console.log('\n📏 Type column constraints:');
      console.log(`   Data Type: ${constraints[0].DATA_TYPE}`);
      console.log(`   Max Length: ${constraints[0].CHARACTER_MAXIMUM_LENGTH}`);
      console.log(`   Nullable: ${constraints[0].IS_NULLABLE}`);
      console.log(`   Default: ${constraints[0].COLUMN_DEFAULT}`);
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNotificationsTable(); 