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

        // ✅ 인덱스 조정 함수
        const adjustIndices = (text, startIdx, endIdx) => {
            if (startIdx > 0) {
                let leftIdx = startIdx;
                while (leftIdx > 0) {
                    const char = text[leftIdx - 1];
                    if (char === ' ' || char === '\n' || char === '.' || char === ',' || char === '’' || char === '‘') {
                        break;
                    }
                    leftIdx--;
                }
                startIdx = leftIdx;
            }

            while (endIdx < text.length - 1 && text[endIdx + 1] !== ' ' && text[endIdx + 1] !== '\n') {
                endIdx++;
            }

            return { start_index: startIdx, end_index: endIdx };
        };

        // ✅ 특정 문장의 index 찾는 함수
        const findIndices = (text, phrase) => {
            const startIndex = text.indexOf(phrase);
            if (startIndex === -1) return null; // 실패하면 null 반환
            return { start_index: startIndex, end_index: startIndex + phrase.length - 1 };
        };

        // ✅ 각 자소서별 질문 & 근거 매칭
        for (let i = 1; i <= coverLetterNum; i++) {
            let coverLetter = {
                cover_letter_id: i,
                questions: [],
                originalText: coverLetterText[i - 1] // ✅ 원본 자기소개서 텍스트 저장
            };

            for (let j = 1; j <= questionNum; j++) {
                let questionKey = `question${i}-${j}`;
                let clueKey = `clue${i}-${j}`;
                let originTextKey = `clue${i}-${j}_origin_text`;

                if (parsed[questionKey]) {
                    let clue = parsed[clueKey] || { start_index: null, end_index: null };
                    let originText = parsed[originTextKey] || null;
                    let extractedText = "근거 없음";
                    let finalIndices = null;

                    // ✅ 1️⃣ _origin_text를 기반으로 인덱스 찾기
                    if (originText && coverLetterText[i - 1]) {
                        finalIndices = findIndices(coverLetterText[i - 1], originText);
                    }

                    // ✅ 2️⃣ _origin_text가 없거나 찾지 못한 경우, 기존 start_index & end_index 사용
                    if (!finalIndices && clue.start_index !== null && clue.end_index !== null) {
                        finalIndices = adjustIndices(coverLetterText[i - 1], clue.start_index, clue.end_index);
                    }

                    // ✅ 최종적으로 추출된 텍스트 저장
                    if (finalIndices) {
                        extractedText = coverLetterText[i - 1].slice(finalIndices.start_index, finalIndices.end_index + 1);
                        coverLetter.questions.push({
                            question: parsed[questionKey],
                            clue: extractedText, // ✅ 조정된 인덱스로 찾은 원본 텍스트
                            clue_indices: finalIndices // ✅ 최종적으로 찾은 start_index, end_index 저장
                        });
                    }
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
