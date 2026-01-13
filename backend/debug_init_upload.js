const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function debugUpload() {
    console.log('--- Debugging Init with File Upload ---');

    // 1. Login
    let token;
    try {
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'relevance_test_user', // Reuse existing user
            password: 'password123'
        });
        token = loginRes.data.token;
    } catch (e) {
        console.log('Login failed, creating fallback user...');
        const user = `upload_test_${Date.now()}`;
        await axios.post('http://localhost:3000/api/auth/signup', { username: user, password: 'password123' });
        const res = await axios.post('http://localhost:3000/api/auth/login', { username: user, password: 'password123' });
        token = res.data.token;
    }
    console.log('✅ Logged in');

    // 2. Create Dummy PDF (just a text file masquerading as PDF for pdf-parse to attempt reading, or handle error)
    // pdf-parse might fail if it's not a real PDF, which is a good test of error handling.
    // However, to test SUCCESS, we ideally need a valid PDF header.
    // Let's rely on server handling invalid PDF gracefully (it should fallback to text).

    const dummyPath = 'dummy_resume.pdf';
    fs.writeFileSync(dummyPath, '%PDF-1.4\n%Dummy content for testing');

    const form = new FormData();
    form.append('resume', fs.createReadStream(dummyPath));
    form.append('mode', 'mentor');
    form.append('jobDescription', 'Testing Engineer');

    try {
        console.log('Uploading file...');
        const res = await axios.post('http://localhost:3000/api/init', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            },
            timeout: 30000
        });
        console.log('✅ Init Success:', res.data.message);

    } catch (err) {
        console.error('❌ Init Failed:', err.response ? err.response.data : err.message);
    } finally {
        if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
    }
}

debugUpload();
