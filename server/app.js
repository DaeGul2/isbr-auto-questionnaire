const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const gptRoutes = require('./routes/gptRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS 설정 (모든 요청 허용)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// ✅ GPT 라우트 등록
app.use('/api/gpt', gptRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
