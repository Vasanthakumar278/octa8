const axios = require('axios');

async function testWebhooks() {
    const N8N_URL = 'http://localhost:5678/webhook/init';
    console.log(`Testing n8n webhook at: ${N8N_URL}`);

    try {
        const response = await axios.post(N8N_URL, {
            resume: "Test Resume Content",
            jobDescription: "Test Job Description"
        });
        console.log('✅ Webhook Response:', response.data);
    } catch (error) {
        console.error('❌ Webhook Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testWebhooks();
