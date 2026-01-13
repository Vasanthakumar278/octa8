const axios = require('axios');
require('dotenv').config();

async function testDelete() {
    const username = 'debuguser' + Date.now();
    const password = 'password123';
    const baseUrl = 'http://localhost:3000';

    try {
        console.log(`1. Attempting login/signup for ${username}...`);
        let token;
        try {
            await axios.post(`${baseUrl}/api/auth/signup`, { username, password });
            console.log('✅ Signup successful');
        } catch (signupErr) {
            console.log('⚠️ Signup failed (maybe already exists)');
        }

        const loginRes = await axios.post(`${baseUrl}/api/auth/login`, { username, password });
        token = loginRes.data.token;
        console.log('✅ Logged in');

        console.log('2. Initializing a new session...');
        // Note: We need a dummy resume or text
        await axios.post(`${baseUrl}/api/init`, {
            mode: 'mentor',
            jobDescription: 'Software Engineer',
            resumeText: 'John Doe - Software Engineer'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Session initialized');

        console.log('3. Fetching sessions...');
        const sessionsRes = await axios.get(`${baseUrl}/api/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const sessions = sessionsRes.data;

        if (sessions.length === 0) {
            console.log('❌ Failed to fetch sessions.');
            return;
        }

        const targetId = sessions[0].id;
        console.log(`✅ Found target session: ${targetId}`);

        console.log(`4. Deleting session ${targetId}...`);
        const deleteRes = await axios.delete(`${baseUrl}/api/session/${targetId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Delete response status:', deleteRes.status);
        console.log('✅ Delete response data:', deleteRes.data);

        console.log('5. Verifying deletion...');
        const verifyRes = await axios.get(`${baseUrl}/api/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const remaining = verifyRes.data;
        const exists = remaining.some(s => s.id === targetId);

        if (!exists) {
            console.log('🎊 SUCCESS: Session was deleted from database!');
        } else {
            console.log('❌ FAILURE: Session still exists in database.');
        }

    } catch (error) {
        console.error('❌ Error during debug test:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testDelete();
