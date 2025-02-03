const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const gptRoutes = require('./routes/gptRoutes');
const authenticateRequest = require('./middlewares/authMiddleware'); // 🔥 추가

dotenv.config();

const app = express();
app.use(express.json());

// ✅ 모든 출처(Origin)에서 요청 허용
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'] // 🔥 Authorization 헤더 추가
}));

// ✅ 모든 요청에 대해 비밀번호 인증 적용
app.use(authenticateRequest);

console.log("✅ GPT Routes Loaded");

// 라우트 설정
app.use('/api/gpt', gptRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
