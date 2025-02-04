export const parseGPTResponse = (response, coverLetterText) => {
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
                questions: [],
                originalText: coverLetterText[i - 1]  // ✅ 원본 자기소개서 텍스트 저장
            };

            for (let j = 1; j <= questionNum; j++) {
                let questionKey = `question${i}-${j}`;
                let clueKey = `clue${i}-${j}`;

                if (parsed[questionKey]) {
                    let clue = parsed[clueKey] || { start_index: null, end_index: null };
                    let extractedText = "근거 없음";

                    // ✅ 원본 자기소개서에서 인덱스 범위에 해당하는 텍스트 추출
                    if (
                        clue.start_index !== null &&
                        clue.end_index !== null &&
                        coverLetterText[i - 1] // 해당 자기소개서 텍스트 존재하는지 확인
                    ) {
                        extractedText = coverLetterText[i - 1].slice(clue.start_index, clue.end_index + 1);
                    }

                    coverLetter.questions.push({
                        question: parsed[questionKey],
                        clue: extractedText, // ✅ 인덱스로 찾은 원본 텍스트
                        clue_indices: clue // ✅ start_index, end_index 저장
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
