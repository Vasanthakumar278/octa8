const axios = require('axios');

async function debugChat() {
    console.log('--- Debugging Mentor Chat ---');
    // Login first to get token
    let token;
    let sessionId;
    try {
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'vasanthakumar', // using the user from screenshot or create new
            password: 'password123'    // assuming password from debug_auth
        }).catch(async () => {
            // fallback create
            const user = `test_${Date.now()}`;
            await axios.post('http://localhost:3000/api/auth/signup', { username: user, password: 'password123' });
            const res = await axios.post('http://localhost:3000/api/auth/login', { username: user, password: 'password123' });
            return res;
        });

        token = loginRes.data.token;
        console.log('✅ Logged in');

        // Init Session
        const initRes = await axios.post('http://localhost:3000/api/init', {
            resumeText: "Experienced React Developer.",
            jobDescription: "React Dev",
            mode: 'mentor'
        }, { headers: { Authorization: `Bearer ${token}` } });

        sessionId = initRes.data.sessionId;
        console.log('✅ Session Init Response (Welcome):\n', initRes.data.message);

        // Send Chat
        const chatRes = await axios.post('http://localhost:3000/api/chat', {
            message: "How can I improve my resume?",
            sessionId: sessionId,
            mode: 'mentor'
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('\n✅ Chat Response (Advice):\n', chatRes.data.reply);

    } catch (err) {
        console.error('❌ Error:', err.response ? err.response.data : err.message);
    }
}

debugChat();
