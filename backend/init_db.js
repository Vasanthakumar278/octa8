const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    console.log('Initializing Database...');
    try {
        // Connect without database selected first to create it if needed
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        const sql = fs.readFileSync(path.join(__dirname, 'db_init.sql'), 'utf8');

        console.log('Running SQL script...');
        await connection.query(sql);

        console.log('✅ Database initialized successfully!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

initDatabase();
