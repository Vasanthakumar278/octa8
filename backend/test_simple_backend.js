const axios = require('axios');

async function simpleTest() {
    console.log('Testing backend /api/init endpoint...\n');

    try {
        const response = await axios.post('http://localhost:3000/api/init', {
            resumeText: 'Test resume',
            jobDescription: 'Test job'
        }, {
            timeout: 30000,
            validateStatus: () => true // Accept any status code
        });

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n❌ Backend server is not running!');
            console.log('Start it with: node server.js');
        }
    }
}

simpleTest();
