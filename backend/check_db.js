const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [sessions] = await pool.execute('SELECT id FROM interview_sessions');
    console.log('Sessions in DB:', sessions.map(s => s.id));

    const [messages] = await pool.execute('SELECT id, session_id FROM messages');
    console.log('Messages in DB:', messages.map(m => ({ id: m.id, sessionId: m.session_id })));

    await pool.end();
}

check();
