export const parseGPTResponse = (response) => {
    try {
        // ✅ 마크다운 형식 제거 (```json 제거)
        const cleanResponse = response.replace(/```json|```/g, "").trim();

        // ✅ JSON으로 파싱
        const parsed = JSON.parse(cleanResponse);

        // ✅ 지원자 식별번호 가져오기
        const keyNumber = parsed.key_number;

        // ✅ cover letter 개수 가져오기
        const coverLetterNum = parsed.cover_letter_num || 1;
        const questionNum = parsed.question_num || 1;

        // ✅ 정리할 객체
        let parsedData = {
            key_number: keyNumber,
            cover_letters: []
        };

        // ✅ 각 자소서별 질문 & 근거 매칭
        for (let i = 1; i <= coverLetterNum; i++) {
            let coverLetter = {
                cover_letter_id: i,
                questions: []
            };

            for (let j = 1; j <= questionNum; j++) {
                let questionKey = `question${i}-${j}`;
                let clueKey = `clue${i}-${j}`;

                if (parsed[questionKey]) {
                    coverLetter.questions.push({
                        question: parsed[questionKey],
                        clue: parsed[clueKey] || "근거 없음"
                    });
                }
            }

            parsedData.cover_letters.push(coverLetter);
        }

        return parsedData;
    } catch (error) {
        console.error("❌ 응답 파싱 오류:", error);
        return {};
    }
};
