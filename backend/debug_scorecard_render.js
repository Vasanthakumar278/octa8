const axios = require('axios');

async function debugScorecard() {
    console.log('--- Debugging Scorecard Generation ---');
    let token;
    let sessionId;
    try {
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'relevance_test_user',
            password: 'password123'
        });
        token = loginRes.data.token;

        // Init Session (Interview Mode)
        const initRes = await axios.post('http://localhost:3000/api/init', {
            resumeText: "Experienced React Developer.",
            jobDescription: "Senior Frontend Engineer",
            mode: 'interview'
        }, { headers: { Authorization: `Bearer ${token}` } });

        sessionId = initRes.data.sessionId;
        console.log('✅ Session Init');

        // Fast forward: mimic answering questions until end
        // We can force end by sending "Finish Interview"
        const finishRes = await axios.post('http://localhost:3000/api/chat', {
            message: "I would like to finish the interview now.",
            sessionId: sessionId,
            mode: 'interview'
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('\n✅ AI Final Response:\n', finishRes.data.reply);

        if (/\[?SCORECARD\]?/i.test(finishRes.data.reply)) {
            console.log("✅ [SCORECARD] tag found (or compatible variation)!");
        } else {
            console.error("❌ [SCORECARD] tag MISSING");
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

debugScorecard();
