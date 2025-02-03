const axios = require('axios');
const { OPENAI_API_URL, openaiHeaders } = require('../config/openaiConfig');

const generateText = async (req, res) => {
    const { prompt, secretPassword } = req.body;
    const serverPassword = process.env.SECRET_PASSWORD; // 백엔드 비밀번호

    // 비밀번호 검증
    if (!secretPassword || secretPassword !== serverPassword) {
        return res.status(403).json({ message: 'Access Denied: Invalid Password' });
    }

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150
            },
            { headers: openaiHeaders }
        );

        res.status(200).json({ message: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error processing your request' });
    }
};

module.exports = { generateText };
