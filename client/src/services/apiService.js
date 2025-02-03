import axiosInstance from "./axiosInstance";

export const sendPrompt = async (prompt, secretPassword) => {
    try {
        const response = await axiosInstance.post("/gpt/generate-text", {
            prompt,
            secretPassword, // 사용자가 입력한 비밀번호 포함
        });
        return response.data;
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
        throw error;
    }
};
