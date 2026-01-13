const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

async function testChatFlow() {
    try {
        console.log("1. Logging in...");
        // 1. Login/Signup
        let token;
        try {
            const loginRes = await axios.post(`${AUTH_URL}/login`, {
                username: 'debug_user',
                password: 'password123'
            });
            token = loginRes.data.token;
        } catch (e) {
            console.log("Login failed, trying signup...");
            await axios.post(`${AUTH_URL}/signup`, {
                username: 'debug_user',
                password: 'password123'
            });
            const loginRes = await axios.post(`${AUTH_URL}/login`, {
                username: 'debug_user',
                password: 'password123'
            });
            token = loginRes.data.token;
        }
        console.log("✅ Logged in. Token obtained.");

        // 2. Init Session
        console.log("2. Initializing Interview Session...");
        const initRes = await axios.post(`${BASE_URL}/init`, {
            resumeText: "Experienced Software Engineer with Node.js and React skills.",
            jobDescription: "Looking for a Senior Backend Developer.",
            mode: "interview"
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const sessionId = initRes.data.sessionId;
        console.log(`✅ Session Created: ${sessionId}`);
        console.log(`AI Welcome: ${initRes.data.message}`);

        // 3. Send Chat Message
        console.log("3. Sending Chat Message (This connects to Ollama)...");
        const chatRes = await axios.post(`${BASE_URL}/chat`, {
            message: "I have 5 years of experience in Node.js.",
            sessionId: sessionId,
            mode: "interview"
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("✅ Chat Response Received:");
        console.log(chatRes.data.reply);

    } catch (error) {
        console.error("\n❌ ERROR DETECTED:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testChatFlow();
