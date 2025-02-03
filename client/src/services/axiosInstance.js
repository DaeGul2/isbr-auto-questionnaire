import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api", // ✅ 환경 변수 활용
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosInstance;
