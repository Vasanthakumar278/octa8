const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USERNAME = `debug_user_${Date.now()}`;
const PASSWORD = 'password123';

async function runTest() {
    console.log(`🚀 Starting Live Debug Test for ${USERNAME}...`);

    try {
        // 1. Signup/Login
        console.log(`\n1️⃣  Authenticating...`);
        let token;
        try {
            const signupRes = await axios.post(`${BASE_URL}/api/auth/signup`, { username: USERNAME, password: PASSWORD });
            console.log('   ✅ Signup successful');
            // Login to get token (though signup might not return it, usually login does)
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { username: USERNAME, password: PASSWORD });
            token = loginRes.data.token;
            console.log('   ✅ Login successful, Token received');
        } catch (e) {
            console.error('   ❌ Auth Failed:', e.response?.data || e.message);
            return;
        }

        // 2. Init Session
        console.log(`\n2️⃣  Initializing Interview...`);
        let sessionId;
        try {
            const initRes = await axios.post(
                `${BASE_URL}/api/init`,
                {
                    resumeText: "Experienced in Node.js, React, and Cloud Architecture.",
                    jobDescription: "Senior Full Stack Engineer",
                    mode: "interview"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            sessionId = initRes.data.sessionId;
            console.log(`   ✅ Session Initialized: ${sessionId}`);
            console.log(`   🤖 AI Welcome: "${initRes.data.message}"`);
        } catch (e) {
            console.error('   ❌ Init Failed:', e.response?.data || e.message);
            return;
        }

        // 3. Send Message
        console.log(`\n3️⃣  Sending Chat Message...`);
        try {
            const chatRes = await axios.post(
                `${BASE_URL}/api/chat`,
                {
                    sessionId: sessionId,
                    message: "I usually design scalable systems using microservices and event-driven architecture.",
                    mode: "interview"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`   ✅ Chat Success`);
            console.log(`   🤖 AI Reply: "${chatRes.data.reply}"`);
        } catch (e) {
            console.error('   ❌ Chat Failed:', e.response?.data || e.message);
        }

    } catch (err) {
        console.error('💥 Unexpected Error:', err.message);
    }
}

runTest();
