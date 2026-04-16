const http = require('http');

const request = (options, postData) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(data || '{}') }));
        });
        req.on('error', reject);
        if (postData) req.write(JSON.stringify(postData));
        req.end();
    });
};

async function runTests() {
    console.log('--- STARTING AUTH TESTS ---');
    const email = 'test' + Date.now() + '@example.com';
    const password = 'Password@123';

    try {
        // 1. Register
        console.log('\n[1] Registering user:', email);
        const regRes = await request({
            hostname: 'localhost', port: 5001, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { name: 'Automated Test', email, password, role: 'customer' });
        console.log('Register Res:', regRes.statusCode, regRes.data.success ? 'Success' : regRes.data);

        // 2. Login
        console.log('\n[2] Logging in user:', email);
        const loginRes = await request({
            hostname: 'localhost', port: 5001, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email, password });
        console.log('Login Res:', loginRes.statusCode, loginRes.data.success ? 'Success' : loginRes.data);
        
        const accessToken = loginRes.data.accessToken;
        
        // 3. Protected Route
        console.log('\n[3] Testing Protected Route (/api/auth/me)');
        const meRes = await request({
            hostname: 'localhost', port: 5001, path: '/api/auth/me', method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        console.log('Me Res:', meRes.statusCode, meRes.data.success ? 'Success (User: ' + meRes.data.user.email + ')' : meRes.data);
        
        console.log('\n--- TESTS COMPLETED ---');
    } catch (e) {
        console.error('Test Error:', e.message);
    }
}

runTests();
