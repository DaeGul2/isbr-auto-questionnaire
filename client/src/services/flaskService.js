import axios from "axios";
import axiosInstance from "./axiosInstance";

// ✅ Flask 서버 주소를 .env에서 가져오기
const FLASK_API_URL = process.env.REACT_APP_FLASK_API_URL;

// ✅ 엑셀 파일 업로드 및 PPT 변환 요청
// ✅ Flask 서버에 엑셀 업로드 + PPT 생성 요청
// ✅ Flask 서버에 엑셀 업로드 + PPT 생성 요청
export const uploadExcelAndGeneratePPT = async (formData) => {
    try {
        const response = await axios.post(`http://localhost:5000/generate_ppt`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return response.data; // ✅ Flask 서버에서 받은 응답 (PPT URL 등)
    } catch (error) {
        console.error("❌ Flask 서버 업로드 실패:", error);
        throw error;
    }
};
// ✅ PPT 파일 다운로드 함수
export const downloadPPT = async (pptUrl) => {
    try {
        const response = await axios.get(pptUrl, { responseType: "blob" });

        // ✅ Blob을 사용해 다운로드 처리
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "output.pptx");
        document.body.appendChild(link);
        link.click();
        link.remove(); // ✅ 다운로드 후 링크 제거
    } catch (error) {
        console.error("❌ PPT 다운로드 실패:", error);
        alert("❌ PPT 다운로드 중 오류 발생");
    }
};
