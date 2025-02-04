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
            // Start index 조정
            if (startIdx > 0) {
                let leftIdx = startIdx;

                // 왼쪽 방향으로 이동하며 공백, 개행, 문장 부호 전까지 조정
                while (leftIdx > 0) {
                    const char = text[leftIdx - 1];
                    if (char === ' ' || char === '\n' || char === '.' || char === ',' || char === '’' || char === '‘') {
                        break;
                    }
                    leftIdx--;
                }
                startIdx = leftIdx;  // 조정된 시작 인덱스 적용
            }

            // End index 조정: 공백(' ')이나 개행('\n')을 만날 때까지 확장, 단 맨 끝 글자는 초과하지 않음
            while (endIdx < text.length - 1 && text[endIdx + 1] !== ' ' && text[endIdx + 1] !== '\n') {
                endIdx++;
            }

            return { start_index: startIdx, end_index: endIdx };
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

                    // ✅ 원본 자기소개서에서 인덱스 범위에 해당하는 텍스트 추출 및 인덱스 조정
                    if (
                        clue.start_index !== null &&
                        clue.end_index !== null &&
                        coverLetterText[i - 1] // 해당 자기소개서 텍스트 존재하는지 확인
                    ) {
                        let adjustedClue = adjustIndices(coverLetterText[i - 1], clue.start_index, clue.end_index);
                        extractedText = coverLetterText[i - 1].slice(adjustedClue.start_index, adjustedClue.end_index + 1);

                        coverLetter.questions.push({
                            question: parsed[questionKey],
                            clue: extractedText, // ✅ 조정된 인덱스로 찾은 원본 텍스트
                            clue_indices: adjustedClue // ✅ 조정된 start_index, end_index 저장
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
