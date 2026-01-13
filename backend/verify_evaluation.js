const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        const username = `test_${Date.now()}`;
        const password = 'password123';

        console.log(`1. Signing up user ${username}...`);
        try {
            await axios.post(`${BASE_URL}/auth/signup`, { username, password });
            console.log("Signup successful.");
        } catch (e) {
            console.log("Signup might have failed (exists?), proceeding to login.");
        }

        console.log("2. Logging in...");
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username, password });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log("Logged in.");

        console.log("3. Starting Interview (Resume has 'React Expert', Answer will be 'I don't know')...");
        const initRes = await axios.post(`${BASE_URL}/init`, {
            resumeText: "SENIOR REACT DEVELOPER. 10 years experience. Expert in Hooks, Redux, Context.",
            jobDescription: "Senior React Developer needed.",
            mode: "interview"
        }, { headers });

        const sessionId = initRes.data.sessionId;
        console.log(`Session ID: ${sessionId}`);

        // 4. Give bad answers
        const badAnswers = [
            "I don't know what React is.",
            "I have never used hooks.",
            "What is Redux?",
            "I just want money.",
            "Pass."
        ];

        for (const answer of badAnswers) {
            process.stdout.write('.');
            await axios.post(`${BASE_URL}/chat`, {
                sessionId,
                message: answer,
                mode: 'interview'
            }, { headers });
        }
        console.log("\nBad answers sent.");

        // 5. Force Finish
        console.log("Finishing interview...");
        const finalRes = await axios.post(`${BASE_URL}/chat`, {
            sessionId,
            message: "Stop interview.",
            mode: 'interview'
        }, { headers });

        console.log("\n--- FINAL EVALUATION (Expect Low Score) ---");
        console.log(finalRes.data.reply);

    } catch (error) {
        console.error("Test failed detail:", error.code || error.message);
        if (error.response) console.error("Response data:", error.response.data);
    }
}

runTest();
