const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function checkTables() {
  try {
    console.log('Checking database tables...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check each table structure
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🔍 Table: ${tableName}`);
      
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('  Columns:');
        columns.forEach(col => {
          console.log(`    ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        // Check row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        console.log(`  Row count: ${count}`);
        
        // Show sample data if table has data
        if (count > 0) {
          const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
          console.log('  Sample data:');
          sampleData.forEach((row, index) => {
            console.log(`    Row ${index + 1}:`, row);
          });
        }
        
      } catch (error) {
        console.log(`  ❌ Error checking table ${tableName}:`, error.message);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

checkTables(); 