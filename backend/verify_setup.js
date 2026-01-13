const axios = require('axios');
require('dotenv').config();

const N8N_HOST = process.env.N8N_HOST || 'http://localhost:5678';
const OLLAMA_HOST = 'http://localhost:11434'; // Default Ollama port

async function checkService(name, url) {
    try {
        await axios.get(url, { timeout: 2000 });
        console.log(`✅ ${name} is reachable at ${url}`);
        return true;
    } catch (error) {
        // n8n might return 401 or 404 on root, which is fine, we just want to know it's there.
        // Connection refused is the real error we care about.
        if (error.code === 'ECONNREFUSED') {
            console.error(`❌ ${name} is NOT reachable at ${url}. Is it running?`);
            return false;
        }
        // If we get a status code response, the service is up.
        console.log(`✅ ${name} is reachable (responded with ${error.response?.status})`);
        return true;
    }
}

async function verify() {
    console.log('--- Verifying Environment Setup ---');

    // Ollama check - checking version endpoint is usually a safe bet
    const ollamaUp = await checkService('Ollama', `${OLLAMA_HOST}/api/version`);

    if (!ollamaUp) {
        console.error('\n⚠️  Please ensure Ollama is running.');
        process.exit(1);
    }

    // Backend check
    const backendUp = await checkService('Backend', `http://localhost:3000`);
    if (!backendUp) {
        console.error('\n⚠️  Please ensure Backend is running on port 3000.');
    }

    console.log('--- Setup Verified ---\n');
}

verify();
