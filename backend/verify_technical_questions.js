const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

async function verifyTechnicalFocus() {
    try {
        console.log("1. Logging in...");
        let token;
        try {
            const loginRes = await axios.post(`${AUTH_URL}/login`, { username: 'debug_user', password: 'password123' });
            token = loginRes.data.token;
        } catch {
            const signupRes = await axios.post(`${AUTH_URL}/signup`, { username: 'debug_user', password: 'password123' });
            const loginRes = await axios.post(`${AUTH_URL}/login`, { username: 'debug_user', password: 'password123' });
            token = loginRes.data.token;
        }

        // 2. Init Session (HR Phase)
        const initRes = await axios.post(`${BASE_URL}/init`, {
            resumeText: "Skills: Python, Django, PostgreSQL, Docker.",
            jobDescription: "Python Backend Developer.",
            mode: "interview"
        }, { headers: { 'Authorization': `Bearer ${token}` } });

        const sessionId = initRes.data.sessionId;
        console.log(`\nInit Question (HR?): ${initRes.data.message}`);

        // 3. Fast Forward to TECH Phase (Question 4+)
        // We need to send 3 messages to push count > 3 for TECH phase transition logic in current server.js
        console.log("\nSkipping through HR questions...");
        await axios.post(`${BASE_URL}/chat`, { message: "I work well in teams.", sessionId, mode: "interview" }, { headers: { 'Authorization': `Bearer ${token}` } });
        await axios.post(`${BASE_URL}/chat`, { message: "I communicated clearly.", sessionId, mode: "interview" }, { headers: { 'Authorization': `Bearer ${token}` } });
        await axios.post(`${BASE_URL}/chat`, { message: "I solved the problem.", sessionId, mode: "interview" }, { headers: { 'Authorization': `Bearer ${token}` } });

        // 4. Now we should be in TECH phase (count 4)
        console.log("\nAsking Question #4 (Should be TECHNICAL and related to Python/Django)...");
        const techRes = await axios.post(`${BASE_URL}/chat`, {
            message: "I am ready for technical questions.",
            sessionId: sessionId,
            mode: "interview"
        }, { headers: { 'Authorization': `Bearer ${token}` } });

        console.log(`\nAI Question: ${techRes.data.reply}`);

        if (techRes.data.reply.toLowerCase().includes('python') || techRes.data.reply.toLowerCase().includes('django') || techRes.data.reply.toLowerCase().includes('database') || techRes.data.reply.toLowerCase().includes('docker')) {
            console.log("✅ SUCCESS: Question is technical and related to resume.");
        } else {
            console.log("⚠️ WARNING: Question might be generic. Check output.");
        }

    } catch (error) {
        console.error(error.message);
    }
}

verifyTechnicalFocus();
