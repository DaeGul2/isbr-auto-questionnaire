import axiosInstance from "./axiosInstance";

// ✅ 1. 고정된 프로젝트 설명 및 요청 방식
const PROJECT_DESCRIPTION = `
이 프로젝트는 지원자의 평가 데이터를 분석하고 GPT를 통해 평가 기준에 맞는 피드백을 생성하는 시스템입니다.
GPT는 제공된 데이터를 분석하여 지원자의 강점과 보완할 점을 도출하고, 주어진 기준에 맞춰 설명을 작성해야 합니다.
주어진 데이터 외의 추가적인 해석을 하지 말고, 정확한 정보만 반영해야 합니다.
`;

// ✅ 3. 고정된 응답 형식
const RESPONSE_FORMAT = `
응답은 다음과 같은 JSON 형식으로 반환되어야 합니다:
{
  "평가결과": "지원자는 높은 직무 적합도를 보이며, 창의적인 문제 해결 능력이 강점으로 평가됩니다.",
  "강점": ["창의적인 문제 해결 능력", "빠른 학습 능력"],
  "보완점": ["팀워크 강화 필요"]
}
JSON 이외의 형식으로 응답하지 마세요.
`;

export const sendPrompt = async (userData, userRequest, secretPassword) => {
    // ✅ 2. 사용자 실제 데이터 (선택된 컬럼과 행)
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

    try {
        const response = await axiosInstance.post("/gpt/generate-text", {
            prompt: finalPrompt,
            secretPassword
        });
        return response.data;
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
        throw error;
    }
};
