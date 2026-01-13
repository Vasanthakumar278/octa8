const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USERNAME = `interview_test_${Date.now()}`;
const PASSWORD = 'password123';

async function testInterviewQuestions() {
    console.log(`🎤 Testing INTERVIEW MODE - Question Length\n`);

    try {
        // 1. Auth
        const loginRes = await axios.post(`${BASE_URL}/api/auth/signup`, { username: USERNAME, password: PASSWORD })
            .then(() => axios.post(`${BASE_URL}/api/auth/login`, { username: USERNAME, password: PASSWORD }));
        const token = loginRes.data.token;
        console.log('✅ Authenticated\n');

        // 2. Init INTERVIEW Session
        const initRes = await axios.post(
            `${BASE_URL}/api/init`,
            {
                resumeText: "BARANIDHARAN K - Web Developer with experience in Java, Python, SQL, React, Node.js. Built multiple web applications.",
                jobDescription: "Full Stack Developer",
                mode: "interview"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionId = initRes.data.sessionId;
        console.log(`📋 Initial Question:`);
        console.log(`"${initRes.data.message}"`);
        console.log(`Length: ${initRes.data.message.length} characters\n`);

        // 3. Answer and get next question
        const chatRes = await axios.post(
            `${BASE_URL}/api/chat`,
            {
                sessionId,
                message: "I have worked on several projects using React for frontend and Node.js for backend.",
                mode: "interview"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`📋 Follow-up Question:`);
        console.log(`"${chatRes.data.reply}"`);
        console.log(`Length: ${chatRes.data.reply.length} characters\n`);

        if (chatRes.data.reply.length > 300) {
            console.log('⚠️  WARNING: Question is still too long (>300 chars)');
        } else {
            console.log('✅ Question length is good!');
        }

    } catch (err) {
        console.error('💥 Error:', err.response?.data || err.message);
    }
}

testInterviewQuestions();
