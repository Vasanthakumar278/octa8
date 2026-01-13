const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USERNAME = `debug_user_${Date.now()}`;
const PASSWORD = 'password123';

async function runTest() {
    console.log(`🚀 Starting REPRO Test for ${USERNAME}...`);

    try {
        // 1. Signup/Login
        const loginRes = await axios.post(`${BASE_URL}/api/auth/signup`, { username: USERNAME, password: PASSWORD })
            .then(() => axios.post(`${BASE_URL}/api/auth/login`, { username: USERNAME, password: PASSWORD }));
        const token = loginRes.data.token;

        // 2. Init Session
        const initRes = await axios.post(
            `${BASE_URL}/api/init`,
            {
                resumeText: "Experienced in Node.js, React, and Cloud Architecture.",
                jobDescription: "Senior Full Stack Engineer",
                mode: "interview"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionId = initRes.data.sessionId;
        console.log(`   ✅ Session Initialized`);

        // 3. Send Message - EXACT USER INPUT
        console.log(`\n3️⃣  Sending User's Exact Message...`);
        const message = "tell about fullstack development";
        const chatRes = await axios.post(
            `${BASE_URL}/api/chat`,
            { sessionId, message, mode: "interview" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`   ✅ Chat Success`);
        console.log(`   🤖 AI Reply: "${chatRes.data.reply}"`);

    } catch (err) {
        console.error('💥 Error:', err.message);
    }
}

runTest();
