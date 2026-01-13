const axios = require('axios');

async function testOllama() {
    console.log('Testing Ollama with phi3:mini...');

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'phi3:mini',
            prompt: 'Say hello in one sentence.',
            stream: false
        }, {
            timeout: 30000
        });

        console.log('✅ Ollama Response:', response.data.response);
        return true;
    } catch (error) {
        console.error('❌ Ollama Test Failed:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
        return false;
    }
}

testOllama();
