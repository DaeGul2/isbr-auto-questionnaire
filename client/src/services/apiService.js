import axiosInstance from "./axiosInstance";

// ✅ 1. 고정된 프로젝트 설명 및 요청 방식
const PROJECT_DESCRIPTION = `
당신은 면접 전문가입니다. 지원자의 실제 서류 데이터와, 지원자가 지원한 기업의 평가 기준에 맞게 실제 면접 질문을 생성합니다.

데이터는 다음과 같습니다:
1. 지원자 식별 번호
2. 해당 지원자가 기입한 실제 정보 (자기소개서)
3. 만들어야 하는 질문의 개수는, 추가요청사항을 읽고 반영해주세요.

📌 중요한 요청:
각 질문은 반드시 "자기소개서" 내에서 해당 문장과 직접적인 연관이 있어야 합니다.  
각 질문이 유래된 자기소개서 내 "문장"을 그대로 사용하지 말고, **그 문장이 시작된 위치(start_index)와 끝나는 위치(end_index)를 반환**하세요.  
매우 중요 : 당신 질문에 대한 답변이 이미 자소서 내에 있는 경우엔 질문으로 사용하지 말아야합니다. 
단순 반복 질문은 하면 안 됩니다. 
ex) 자소서 내용 : 의사소통 부족 문제를 보완하기 위해 '여우로운 리더십' 전달. <- 생성한 질문 : "프로젝트 중 의사소통 부족문제를 어떻게 해결했나요"

📌 예시:  
질문: "친환경 패키지 바우처 지원 아이디어의 구체적인 실행 계획은 무엇인가요?"  
근거(출처): { "start_index": 55, "end_index": 120 }  
- ✅ **근거는 반드시 원본 자기소개서 내에서 찾을 수 있어야 합니다.**
- ✅ **근거(출처)는 되도록 짧되, 온전한 '단어'로 시작해야합니다. 조사(postposition)등으로 시작하는 게 아닙니다.**
- ✅ **당신이 만들 질문은 지원자의 자소서 내용을 유도하는 것이 아닌, 자소서로부터 당신이 면접 질문으로서 사용가능한 부분을 찾는 겁니다.**
- ❌ **자기소개서와 무관한 질문을 만들지 마세요.**
- ❌ **질문과 근거를 동일한 텍스트로 반환하지 마세요.**
  
각각의 질문은 자기소개서 내용과 일치해야 하며, **출처를 반환할 때에는 원본 자소서에서 해당 문장을 찾아 인덱스로 반환**하세요. 

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
