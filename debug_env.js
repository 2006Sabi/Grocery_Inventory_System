const dotenv = require('dotenv');
const path = require('path');
const result = dotenv.config();
console.log('Result:', result);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Current Dir:', process.cwd());
console.log('Env Path:', path.resolve(process.cwd(), '.env'));
