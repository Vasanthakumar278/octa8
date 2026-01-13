const axios = require('axios');

async function testN8nWorkflow() {
    console.log('Testing n8n Init Workflow...\n');

    const testData = {
        resume: 'John Doe - Software Engineer with 5 years experience in React, Node.js',
        jobDescription: 'Looking for a Full Stack Developer with React and Node.js experience'
    };

    try {
        console.log('Sending request to: http://localhost:5678/webhook/init');
        console.log('With data:', JSON.stringify(testData, null, 2));

        const response = await axios.post('http://localhost:5678/webhook/init', testData, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ Workflow Success!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.error('\n❌ Workflow Failed:');
        console.error('Status:', error.response?.status);
        console.error('Error Message:', error.response?.data?.message || error.message);

        if (error.response?.data) {
            console.error('Full Response:', JSON.stringify(error.response.data, null, 2));
        }
        return false;
    }
}

testN8nWorkflow();
