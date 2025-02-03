export const parseGPTResponse = (response) => {
    try {
        return JSON.parse(response);
    } catch (error) {
        console.error("❌ 응답 파싱 오류:", error);
        return {};
    }
};
