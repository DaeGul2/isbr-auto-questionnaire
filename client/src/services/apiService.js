import axiosInstance from "./axiosInstance";

// ✅ 1. 고정된 프로젝트 설명 및 요청 방식
const PROJECT_DESCRIPTION = `
당신은 면접 전문가입니다. 지원자의 실제 자소서를 근거로 실제 면접 질문을 생성합니다.
자소서1~N을 읽어주세요.


중요한 요청:
1. 각 질문은 반드시 "자기소개서"내용을 기준으로 만들어야합니다.
2. 각 질문을 만들 땐, 자기소개서를 참고하되, 자기소개서 안에 당신이 만든 질문에 대한 답이 이미 존재하는 단순한 난이도의 질문을 만들어선 안 됩니다.
3. 각 질문을 만들 땐, 자기소개서의 근거가되는 부분을 고도화하여 질문을 만들어주세요.
4. 각 질문을 만들 땐, 해당 질문의 '근거'가되는 부분을 자소서 내에서 찾아야합니다.
5. 각 질문의 근거를 찾을 땐, 일반적으로 '온전한 문장'을 찾아야합니다. 즉, 주어로 시작하여 끝맺음 문장으로 끝나는 부분을 찾아야합니다.
6. 각 질문의 근거를 찾을 때 온전한 문장이 100자를 넘어가게 될 경우, 그 내에서 최대한 짧게 온전한문장을 이루는 부분을 찾아야합니다.
7. 각 질문을 만들 땐 단순 반복 질문은 하면 안 됩니다.
8. 각 질문의 근거는 '한 개의 문장'이어야합니다. 두 개의 문장은 되도록 찾지 말아주세요.
9. 각 질문의 근거를 찾을 때 start index와 end index가 반드시 문장 길이보다 짧거나 길면 안 됩니다. 또한, 추후 처리를 염두해 앞 뒤 약 10개 인덱스정도를 확보한 이후로 찾아주세요.
10. 자기소개서와 무관한 질문을 만들지 마세요.
11. 근거는 무조건 찾아야합니다.
12. 각 질문의 난이도는 최소 쉬움, 보통, 어려움 3단계 중 각각 한 개씩 필요합니다.
13. 지원자의 직무를 당신이 파악하여 직무 관련 질문, HR일반 관련 질문이 골고루 분배되도록 만들어주세요.
14. 질문자가 답변했을 때 꼬리질문이 가능하도록 질문을 유도해주세요.
  
각각의 질문은 자기소개서 내용과 일치해야 하며, 출처를 반환할 때에는 원본 자소서에서 해당 문장을 찾아 인덱스로 반환하세요. 

`;

// ✅ 3. 고정된 응답 형식 (수정됨)
const RESPONSE_FORMAT = `
응답은 반드시 다음과 같은 JSON 형식으로 반환되어야 합니다:
{
  "key_number": "지원자 식별번호",
  "cover_letter_num": 질문을 만들 자소서 개수,
  "question_num": 각 자소서별 만들 질문 개수 , // 배열 아님. 정수값 하나임
  "question1-1": "1번 자소서에 대한 질문 1",
  "question1-2": "1번 자소서에 대한 질문 2",
  "clue1-1": { "start_index": 55, "end_index": 120 }, // 1번 질문의 근거 출처 인덱스
  "clue1-2": { "start_index": 140, "end_index": 180 }, // 2번 질문의 근거 출처 인덱스
  "questionN-M": "N번 자소서에 대한 질문 M",
  "clueN-M": { "start_index": XXX, "end_index": YYY } // N번 자소서 M번 질문의 근거 출처 인덱스
}
JSON 이외의 형식으로 응답하지 마세요.
`;

// ✅ GPT API 요청 함수
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
            max_tokens: 3000,  // ✅ 토큰 수 증가
            secretPassword
        });

        console.log("✅ GPT 응답:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 403) {
                alert("❌ 비밀번호가 틀렸습니다. 다시 확인하세요.");
                return { error: "❌ 비밀번호 오류" };
            } else if (error.response.status === 500) {
                alert("❌ 서버에서 오류가 발생했습니다. 관리자에게 문의하세요.");
                return { error: "❌ 서버 오류 발생" };
            }
        } else {
            alert("❌ 요청 실패. 네트워크 상태를 확인하세요.");
        }

        console.error("❌ API 요청 중 오류 발생:", error);
        throw error;
    }
};
