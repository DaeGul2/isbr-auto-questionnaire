import axiosInstance from "./axiosInstance";

// ✅ 1. 고정된 프로젝트 설명 및 요청 방식
const PROJECT_DESCRIPTION = `
당신은 면접 전문가입니다. 지원자의 실제 서류 데이터와, 지원자가 지원한 기업의 평가 기준에 맞게 실제 면접 질문을 생성합니다.
데이터는 다음과 같습니다.
1. 지원자 식별 번호
2. 해당 지원자가 기입한 실제 정보
- 키 : value 값
- 키는 예를들어 '경험 내용', '자기소개서', '경력 및 담당업무' 등이 될 것입니다.
주어진 데이터 외의 추가적인 해석을 하지 말고, 정확한 정보만 반영해야 합니다.
3. 만들어야 하는 질문의 개수는, 추가요청사항을 읽고 적어주시기 바랍니다.
`;

// ✅ 3. 고정된 응답 형식
const RESPONSE_FORMAT = `
응답은 반드시 다음과 같은 JSON 형식으로 반환되어야 합니다:
{
  "key_number": "지원자 식별번호", // 내가 너한테 보낸 key_number를 반환하면 돼
  "question_num": 요청한 질문의 수,
  "question1": "지원자에 대한 질문1",
  "question2": "지원자에 대한 질문2",
  "question3": "지원자에 대한 질문3" ... 요청한 질문 수만큼 만들면 돼돼
}
JSON 이외의 형식으로 응답하지 마세요.
`;

export const sendPrompt = async (userData, userRequest, secretPassword) => {
    if (!userData || !userData.key_number) {
        throw new Error("❌ 유효한 지원자 데이터가 없습니다. key_number가 필요합니다.");
    }

    // ✅ 2. 사용자 실제 데이터 (개별 지원자)
    const userDataString = JSON.stringify(userData, null, 2);

    // ✅ 4. 사용자가 직접 입력한 추가 요청 사항
    const userRequestString = userRequest.trim() ? `\n추가 요청 사항: ${userRequest}` : "";

    // ✅ 최종 프롬프트 구성
    const finalPrompt = `
${PROJECT_DESCRIPTION}

[사용자 데이터]
${userDataString}

[응답 형식]
${RESPONSE_FORMAT}
${userRequestString}
`;

    console.log("🔹 최종 GPT 요청 프롬프트:", finalPrompt);

    try {
        // ✅ API 요청 (환경변수에서 불러온 엔드포인트 사용)
        const response = await axiosInstance.post("/gpt/generate-text", {
            prompt: finalPrompt,
            max_tokens: 1500,  // ✅ 토큰 수 증가
            secretPassword
        });

        return response.data;
    } catch (error) {
        console.error("❌ API 요청 중 오류 발생:", error);
        throw error;
    }
};
