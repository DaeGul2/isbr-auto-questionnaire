const dotenv = require('dotenv');

dotenv.config();

const authenticateRequest = (req, res, next) => {
    const clientPassword = req.headers['authorization']; // 클라이언트에서 보낸 비밀번호
    const serverPassword = process.env.SECRET_PASSWORD; // 백엔드에 저장된 비밀번호

    if (!clientPassword || clientPassword !== serverPassword) {
        return res.status(403).json({ message: 'Access Denied: Invalid Password' });
    }

    next(); // 비밀번호가 맞다면 다음 미들웨어 실행
};

module.exports = authenticateRequest;
