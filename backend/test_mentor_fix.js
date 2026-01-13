const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USERNAME = `mentor_test_${Date.now()}`;
const PASSWORD = 'password123';

async function testMentorMode() {
    console.log(`🧑‍🏫 Testing MENTOR MODE - Exact User Scenario\n`);

    try {
        // 1. Auth
        console.log('1️⃣  Authenticating...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/signup`, { username: USERNAME, password: PASSWORD })
            .then(() => axios.post(`${BASE_URL}/api/auth/login`, { username: USERNAME, password: PASSWORD }));
        const token = loginRes.data.token;
        console.log('   ✅ Logged in\n');

        // 2. Init MENTOR Session
        console.log('2️⃣  Initializing MENTOR session...');
        const initRes = await axios.post(
            `${BASE_URL}/api/init`,
            {
                resumeText: "Experienced in Node.js, React, and Cloud Architecture.",
                jobDescription: "Senior Full Stack Engineer",
                mode: "mentor"  // ← MENTOR MODE
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionId = initRes.data.sessionId;
        console.log(`   ✅ Session: ${sessionId}`);
        console.log(`   🤖 Welcome: "${initRes.data.message}"\n`);

        // 3. Send EXACT user message from screenshot
        console.log('3️⃣  User asks: "tell about fullstack development"');
        const chatRes = await axios.post(
            `${BASE_URL}/api/chat`,
            {
                sessionId,
                message: "tell about fullstack development",  // ← EXACT MESSAGE
                mode: "mentor"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`   ✅ Response received\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 OCTA8 MENTOR REPLY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(chatRes.data.reply);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check if it's a question (BAD) or an answer (GOOD)
        if (chatRes.data.reply.includes('?')) {
            console.log('⚠️  WARNING: Response contains a question mark!');
            console.log('   This might indicate the AI is asking instead of answering.');
        } else {
            console.log('✅ LOOKS GOOD: Response is informative, not a question.');
        }

    } catch (err) {
        console.error('💥 Error:', err.response?.data || err.message);
    }
}

testMentorMode();
