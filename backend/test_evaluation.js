const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USERNAME = `eval_test_${Date.now()}`;
const PASSWORD = 'password123';

async function testEvaluation() {
    console.log(`📊 Testing INTERVIEW EVALUATION\n`);

    try {
        // 1. Auth
        const loginRes = await axios.post(`${BASE_URL}/api/auth/signup`, { username: USERNAME, password: PASSWORD })
            .then(() => axios.post(`${BASE_URL}/api/auth/login`, { username: USERNAME, password: PASSWORD }));
        const token = loginRes.data.token;
        console.log('✅ Authenticated');

        // 2. Init
        const initRes = await axios.post(
            `${BASE_URL}/api/init`,
            {
                resumeText: "Experienced Software Engineer with expertise in React, Node.js, and Java. Worked on large scale distributed systems.",
                jobDescription: "Senior Full Stack Developer",
                mode: "interview"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionId = initRes.data.sessionId;
        console.log('✅ Interview Initialized');

        // 3. Send a few answers
        await axios.post(`${BASE_URL}/api/chat`, { sessionId, message: "I have 5 years of experience in React.", mode: "interview" }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Sent answer 1');

        // 4. Send "finish" to trigger evaluation
        console.log('⌛ Triggering Evaluation (sending "finish")...');
        const evalRes = await axios.post(
            `${BASE_URL}/api/chat`,
            { sessionId, message: "finish", mode: "interview" },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 AI EVALUATION REPLY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(evalRes.data.reply);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check if scores are present in the text
        const hasTechScore = /Technical Score:?\s*\d+/i.test(evalRes.data.reply);
        const hasCommScore = /Communication Score:?\s*\d+/i.test(evalRes.data.reply);

        if (hasTechScore && hasCommScore) {
            console.log('✅ Scores detected in AI response text.');
        } else {
            console.log('❌ Scores MISSING or FORMATTED INCORRECTLY in AI response.');
        }

    } catch (err) {
        console.error('💥 Error:', err.response?.data || err.message);
    }
}

testEvaluation();
