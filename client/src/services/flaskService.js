import axios from "axios";
import axiosInstance from "./axiosInstance";

// ✅ Flask 서버 주소를 .env에서 가져오기
const FLASK_API_URL = process.env.REACT_APP_FLASK_API_URL;

// ✅ 엑셀 파일 업로드 및 PPT 변환 요청
// ✅ Flask 서버에 엑셀 업로드 + PPT 생성 요청
export const uploadExcelAndGeneratePPT = async (excelFile, idToText) => {
    try {
        const formData = new FormData();
        formData.append("file", excelFile);
        formData.append("id_to_text", JSON.stringify(idToText)); // ✅ 질문 데이터도 함께 보냄

        const response = await axios.post(`http://localhost:5000/generate_ppt`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return response.data; // ✅ Flask 서버에서 받은 응답 (PPT URL 등)
    } catch (error) {
        console.error("❌ Flask 서버 업로드 실패:", error);
        throw error;
    }
};

// ✅ 생성된 PPT 다운로드
export const downloadPPT = async (pptUrl) => {
    try {
        window.location.href = pptUrl; // ✅ Flask 서버에서 반환한 URL로 이동하여 다운로드
    } catch (error) {
        console.error("❌ PPT 다운로드 실패:", error);
        throw error;
    }
};
