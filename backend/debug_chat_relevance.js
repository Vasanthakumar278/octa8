const axios = require('axios');

async function debugChatRelevance() {
    console.log('--- Debugging Mentor Relevance ---');
    // Login first
    let token;
    let sessionId;
    try {
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'relevance_test_user',
            password: 'password123'
        }).catch(async (err) => {
            console.log("Login failed, creating new user...");
            await axios.post('http://localhost:3000/api/auth/signup', { username: 'relevance_test_user', password: 'password123' });
            const res = await axios.post('http://localhost:3000/api/auth/login', { username: 'relevance_test_user', password: 'password123' });
            return res;
        });
        token = loginRes.data.token;

        // Init Session
        const initRes = await axios.post('http://localhost:3000/api/init', {
            resumeText: "Experienced React Developer. Familiar with Redux.",
            jobDescription: "Looking for a Frontend Dev who knows how to scale apps.",
            mode: 'mentor'
        }, { headers: { Authorization: `Bearer ${token}` } });

        sessionId = initRes.data.sessionId;

        // Ask specific question
        const question = "What is the best way to handle global state in a large app?";
        console.log(`\n❓ Question: "${question}"`);

        const chatRes = await axios.post('http://localhost:3000/api/chat', {
            message: question,
            sessionId: sessionId,
            mode: 'mentor'
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('\n✅ AI Response:\n', chatRes.data.reply);

    } catch (err) {
        console.error('❌ Error:', err.response ? err.response.data : err.message);
    }
}

debugChatRelevance();
