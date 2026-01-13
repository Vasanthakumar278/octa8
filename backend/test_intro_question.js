const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USERNAME = `test_intro_${Date.now()}`;
const PASSWORD = 'password123';

async function testIntroQuestion() {
    console.log(`🎤 Testing "Tell me about yourself" Opening\n`);

    try {
        // Auth
        const loginRes = await axios.post(`${BASE_URL}/api/auth/signup`, { username: USERNAME, password: PASSWORD })
            .then(() => axios.post(`${BASE_URL}/api/auth/login`, { username: USERNAME, password: PASSWORD }));
        const token = loginRes.data.token;

        // Init Interview
        const initRes = await axios.post(
            `${BASE_URL}/api/init`,
            {
                resumeText: "John Doe - Software Engineer with 5 years experience in React and Node.js",
                jobDescription: "Senior Full Stack Developer",
                mode: "interview"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('📋 Opening Question:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`"${initRes.data.message}"`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (initRes.data.message.toLowerCase().includes('tell me about yourself')) {
            console.log('✅ SUCCESS: Question includes "tell me about yourself"');
        } else {
            console.log('⚠️  WARNING: Question does not include expected phrase');
        }

    } catch (err) {
        console.error('💥 Error:', err.response?.data || err.message);
    }
}

testIntroQuestion();
