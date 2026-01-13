const axios = require('axios');

async function testBothWorkflows() {
    console.log('═══════════════════════════════════════════════════');
    console.log('Testing n8n Workflows with phi3:mini');
    console.log('═══════════════════════════════════════════════════\n');

    // Test 1: Init Workflow
    console.log('📋 Test 1: Interview Initializer (/init)');
    console.log('─────────────────────────────────────────────────\n');

    const initData = {
        resume: 'John Doe - Senior Software Engineer with 5 years in React and Node.js',
        jobDescription: 'Full Stack Developer position requiring React, Node.js, and system design skills'
    };

    try {
        const initResponse = await axios.post('http://localhost:5678/webhook/init', initData, {
            timeout: 30000
        });

        console.log('✅ Init Workflow SUCCESS!');
        console.log('AI Response:', initResponse.data.response || initResponse.data);
        console.log('');
    } catch (error) {
        console.log('❌ Init Workflow FAILED');
        console.log('Error:', error.response?.data || error.message);
        console.log('');
    }

    // Test 2: Chat Workflow
    console.log('💬 Test 2: Comprehensive Interview (/chat)');
    console.log('─────────────────────────────────────────────────\n');

    const chatData = {
        message: 'I have experience building scalable REST APIs using Express.js and have worked with microservices architecture.',
        history: []
    };

    try {
        const chatResponse = await axios.post('http://localhost:5678/webhook/chat', chatData, {
            timeout: 30000
        });

        console.log('✅ Chat Workflow SUCCESS!');
        console.log('AI Response:', chatResponse.data.response || chatResponse.data);
        console.log('');
    } catch (error) {
        console.log('❌ Chat Workflow FAILED');
        console.log('Error:', error.response?.data || error.message);
        console.log('');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('Testing Complete!');
    console.log('═══════════════════════════════════════════════════');
}

testBothWorkflows();
