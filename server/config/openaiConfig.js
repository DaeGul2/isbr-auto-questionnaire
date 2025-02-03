const dotenv = require('dotenv');

dotenv.config();

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const openaiHeaders = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
};

module.exports = { OPENAI_API_URL, openaiHeaders };
