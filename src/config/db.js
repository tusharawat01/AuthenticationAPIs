const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// SQL query to create the users table if it doesn't exist
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        gender ENUM('male', 'female', 'other'),
        dob DATE,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role ENUM('customer', 'service_provider', 'admin'),
        house_flat VARCHAR(255),
        area_society VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(255),
        country VARCHAR(255),
        pin_code VARCHAR(10),
        photo1 VARCHAR(255),
        photo2 VARCHAR(255)
    );
`;

// Function to initialize the database
const initializeDatabase = async () => {
    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        await connection.query(createUsersTable); // Execute create table query
        console.log('Users table ensured to exist.');
    } catch (error) {
        console.error('Error creating users table:', error);
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
};

// Call the initializeDatabase function to ensure the table exists
initializeDatabase();

// Export the pool for use in other modules
module.exports = pool;
