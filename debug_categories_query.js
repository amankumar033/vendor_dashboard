const mysql = require('mysql2/promise');

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

async function debugCategoriesQuery() {
  try {
    console.log('Debugging categories with counts query...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test the exact query from the API
    const query = `
      SELECT 
        sc.category_id,
        sc.name,
        sc.vendor_id,
        sc.description,
        sc.created_at,
        sc.updated_at,
        COALESCE(COUNT(s.service_id), 0) as service_count
      FROM service_categories sc
      LEFT JOIN services s ON sc.name COLLATE utf8mb4_general_ci = s.category COLLATE utf8mb4_general_ci AND s.vendor_id = sc.vendor_id
      WHERE sc.vendor_id = ?
      GROUP BY sc.category_id, sc.name, sc.vendor_id, sc.description, sc.created_at, sc.updated_at
      ORDER BY sc.name ASC
    `;
    
    console.log('Query:', query);
    console.log('Parameters: ["VND1"]');
    
    try {
      const [results] = await connection.execute(query, ['VND1']);
      console.log('✅ Query executed successfully!');
      console.log('Results:', JSON.stringify(results, null, 2));
    } catch (queryError) {
      console.error('❌ Query execution failed:', queryError.message);
      console.error('Error details:', queryError);
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugCategoriesQuery(); 