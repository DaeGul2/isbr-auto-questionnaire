// ✅ 테스트할 자소서 데이터
const answer1 = "공사 인재상 중 업무에 필요한 전문 기술이 부족하다고 생각합니다.인턴 당시 매달 100명의 서포터즈가 만든 과제물을 하나의 PDF 파일에 취합하여 보고서 형식으로 제출하는 업무를 맡았습니다. 처음에는 PDF취합 방법을 몰랐기에 일일이 복사하여 붙여 넣으며 해당 업무에 시간을 많이 들였습니다. 이후 실무에서 활용도 높은 단축키와 OA기능 관련 강의를 수강하고, 출퇴근 시간에 20분씩 복습하며 암기하였습니다. 이를 통해 업무 시간을 50% 줄였고, 다른 업무의 효율을 높일 수 있었습니다. 한국농수산식품유통공사에 입사한 후, 부서의 업무를 수행하기 위한 문서 작성 및 농수산식품의 정보 관리를 위한 OA기술이 필수라고 생각합니다. 이를 위해 강의 수강뿐만 아니라 직접 해당 기술을 미리 적용해 봄으로써 맡은 업무에 어떤 기술이 필요한지 바로 적용할 수 있도록 숙지하고 연습하겠습니다. OA기술 활용도를 높여 농수산식품의 가치를 높일 수 있는 사업을 기획하고 운영하는 데 이바지하겠습니다.";

// ✅ 인덱스 조정 함수 (수정됨)
function adjustIndices(text, startIdx, endIdx) {
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
}

// ✅ 테스트할 인덱스
const originalStartIndex = 547;  // 원래 시작점 (잘못된 위치)
const originalEndIndex = 615;    // 원래 끝점

// ✅ 인덱스 조정 실행
const adjustedClue = adjustIndices(answer1, originalStartIndex, originalEndIndex);

// ✅ 조정된 인덱스를 사용하여 텍스트 추출
const extractedText = answer1.slice(adjustedClue.start_index, adjustedClue.end_index + 1);

console.log("📌 조정된 start_index:", adjustedClue.start_index);
console.log("📌 조정된 end_index:", adjustedClue.end_index);
console.log("📌 추출된 근거 텍스트:", extractedText);
