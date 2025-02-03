export const parseGPTResponse = (response) => {
    try {
        // ✅ 마크다운 형식 제거 (```json 제거)
        const cleanResponse = response.replace(/```json|```/g, "").trim();

        // ✅ JSON으로 파싱
        const parsed = JSON.parse(cleanResponse);

        let parsedQuestions = {};
        for (let i = 1; i <= parsed.question_num; i++) {
            parsedQuestions[`question${i}`] = parsed[`question${i}`];
        }

        return parsedQuestions;  // 파싱된 질문만 반환
    } catch (error) {
        console.error("❌ 응답 파싱 오류:", error);
        return {};
    }
};
