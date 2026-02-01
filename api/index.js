// Vercel serverless function wrapper
const path = require('path');

// Import the built Express app
const serverPath = path.join(__dirname, '..', 'dist', 'index.cjs');
const app = require(serverPath);

// Export as serverless function
module.exports = app;
