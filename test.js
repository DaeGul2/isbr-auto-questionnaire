// ✅ 테스트할 자소서 데이터
const answer1 = "외국인유학생서포터즈 활동 당시, 중국인 팀원의 소극적인 태도로 인해 다른 팀원들이 그 친구의 퇴출을 주장하며 갈등이 발생했습니다. 당시 저는 팀원들의 의견을 존중하면서도 서포터즈 간의 원만한 관계 유지를 위해 갈등을 해결하고자 노력했습니다.우선 중국인 친구와의 면담을 통해 한국어가 서툴러 회의내용을 이해하고 맡은 업무 수행하는데 어려움을 겪고 있다는 점을 알게 되었습니다. 따라서 팀원들에게 상황을 설명하고, 퇴출보다는 그 친구의 역할을 조정하는 방향으로 함께 해결해보자고 설득했습니다. 이후 그 친구에게 회의내용을 중국어로 다시 설명해주고, 중국어 통번역 업무를 맡기며 역할을 재조정했습니다. 그 결과 중국인 친구는 활동에 적극적으로 참여하는 모습을 보였고, 팀원들 간의 관계도 원만하게 유지되었습니다.이 경험을 통해 갈등 상황속에서 소통과 배려의 중요성을 깨달았으며, 입사 후에도 부서원들과 상호 이해를 바탕으로 협력하여 조직에 긍정적인 영향을 미치고자 합니다.";

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
const originalStartIndex = 268;  // 원래 시작점 (잘못된 위치)
const originalEndIndex = 326;    // 원래 끝점

// ✅ 인덱스 조정 실행
const adjustedClue = adjustIndices(answer1, originalStartIndex, originalEndIndex);

// ✅ 조정된 인덱스를 사용하여 텍스트 추출
const extractedText = answer1.slice(adjustedClue.start_index, adjustedClue.end_index + 1);

console.log("📌 조정된 start_index:", adjustedClue.start_index);
console.log("📌 조정된 end_index:", adjustedClue.end_index);
console.log("📌 추출된 근거 텍스트:", extractedText);
