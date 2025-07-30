import mysql from 'mysql2/promise';

const dbConfig = {
  host: '82.29.162.35',
  user: 'kriptocar',
  password: 'kriptocar',
  database: 'kriptocar',
  port: 3306,
  connectTimeout: 10000,
};

// Debug: Log the configuration (remove password for security)
console.log('Database Config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  password: dbConfig.password ? '[HIDDEN]' : '[EMPTY]'
});

export async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Unable to connect to database. Please check your database configuration and ensure MySQL is running.');
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  let connection;
  try {
    connection = await createConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (endError) {
        console.error('Error closing connection:', endError);
      }
    }
  }
} 