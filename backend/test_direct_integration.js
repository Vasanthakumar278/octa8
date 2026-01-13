const axios = require('axios');

async function testDirectIntegration() {
    console.log('═══════════════════════════════════════════════════');
    console.log('Testing Direct Ollama Integration');
    console.log('═══════════════════════════════════════════════════\n');

    // Test 1: Init Endpoint
    console.log('📋 Test 1: Interview Init (/api/init)');
    console.log('─────────────────────────────────────────────────\n');

    const initData = {
        resumeText: 'John Doe - Senior Software Engineer with 5 years of experience in React, Node.js, and system design. Built scalable REST APIs and microservices.',
        jobDescription: 'Full Stack Developer position requiring React, Node.js, and distributed systems experience.'
    };

    try {
        const initResponse = await axios.post('http://localhost:3000/api/init', initData, {
            timeout: 35000
        });

        console.log('✅ INIT ENDPOINT SUCCESS!');
        console.log('Session ID:', initResponse.data.sessionId);
        console.log('\nAI Response:');
        console.log(initResponse.data.message);
        console.log('\n');
    } catch (error) {
        console.log('❌ INIT ENDPOINT FAILED');
        console.log('Error:', error.response?.data || error.message);
        console.log('\n');
        return;
    }

    // Test 2: Chat Endpoint
    console.log('💬 Test 2: Chat Response (/api/chat)');
    console.log('─────────────────────────────────────────────────\n');

    const chatData = {
        message: 'I have experience building scalable REST APIs using Express.js and implementing microservices architecture with Docker and Kubernetes.',
        history: []
    };

    try {
        const chatResponse = await axios.post('http://localhost:3000/api/chat', chatData, {
            timeout: 35000
        });

        console.log('✅ CHAT ENDPOINT SUCCESS!');
        console.log('\nAI Response:');
        console.log(chatResponse.data.reply);
        console.log('\n');
    } catch (error) {
        console.log('❌ CHAT ENDPOINT FAILED');
        console.log('Error:', error.response?.data || error.message);
        console.log('\n');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('Testing Complete!');
    console.log('═══════════════════════════════════════════════════');
}

testDirectIntegration();
