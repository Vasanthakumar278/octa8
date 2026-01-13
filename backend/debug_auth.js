const axios = require('axios');

async function debugAuth() {
    console.log('--- Debugging Auth ---');
    const testUser = `debug_${Date.now()}`;
    const password = 'password123';

    try {
        console.log(`\n1. Attempting Signup for ${testUser}...`);
        const signupRes = await axios.post('http://localhost:3000/api/auth/signup', {
            username: testUser,
            password: password
        });
        console.log('✅ Signup Success:', signupRes.data);
    } catch (err) {
        console.log('❌ Signup Failed:', err.response ? err.response.data : err.message);
        console.log('Status:', err.response ? err.response.status : 'N/A');
    }

    try {
        console.log(`\n2. Attempting Login for ${testUser}...`);
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: testUser,
            password: password
        });
        console.log('✅ Login Success:', loginRes.data);
    } catch (err) {
        console.log('❌ Login Failed:', err.response ? err.response.data : err.message);
        console.log('Status:', err.response ? err.response.status : 'N/A');
    }
}

debugAuth();
