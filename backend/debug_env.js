require('dotenv').config();

console.log('--- Debug Env ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER ? `'${process.env.DB_USER}'` : 'UNDEFINED');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PWD:', process.cwd());
