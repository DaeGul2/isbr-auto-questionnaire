export const parseGPTResponse = (response) => {
    try {
        // ✅ 마크다운 형식 제거 (```json 제거)
        const cleanResponse = response.replace(/```json|```/g, "").trim();

        // ✅ JSON으로 파싱
        const parsed = JSON.parse(cleanResponse);

        // ✅ key_number와 질문들 파싱
        let parsedData = {
            key_number: parsed.key_number, // ✅ 지원자 식별번호 포함
            question_num: parsed.question_num
        };

        for (let i = 1; i <= parsed.question_num; i++) {
            parsedData[`question${i}`] = parsed[`question${i}`];
        }

        return parsedData;  // ✅ key_number 포함된 데이터 반환
    } catch (error) {
        console.error("❌ 응답 파싱 오류:", error);
        return {};
    }
};
