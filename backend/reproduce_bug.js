const axios = require('axios');
require('dotenv').config();

async function reproduce() {
    const baseUrl = 'http://localhost:3000';
    const username = 'debuguser' + Date.now();
    const password = 'password123';

    try {
        console.log('1. Creating user...');
        await axios.post(`${baseUrl}/api/auth/signup`, { username, password });
        const loginRes = await axios.post(`${baseUrl}/api/auth/login`, { username, password });
        const token = loginRes.data.token;
        console.log('✅ Logged in');

        console.log('2. Creating session...');
        const initRes = await axios.post(`${baseUrl}/api/init`, {
            mode: 'interview',
            jobDescription: 'Dev',
            resumeText: 'Experience: Code'
        }, { headers: { 'Authorization': `Bearer ${token}` } });
        const sessionId = initRes.data.sessionId;
        console.log(`✅ Session created: ${sessionId}`);

        console.log('3. Deleting session...');
        await axios.delete(`${baseUrl}/api/session/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Delete call finished');

        console.log('4. Fetching sessions to verify...');
        const listRes = await axios.get(`${baseUrl}/api/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const exists = listRes.data.some(s => s.id === sessionId);
        if (exists) {
            console.log('❌ BUG REPRODUCED: Session still exists in list!');
        } else {
            console.log('✅ Session NOT in list. Deletion persisted.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

reproduce();
