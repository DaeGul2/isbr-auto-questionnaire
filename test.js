// ✅ 테스트할 자소서 데이터
const answer1 = "[트렌드를 반영한 아이디어로 만든 분석적 사고]현재 전 세계적으로 친환경 제품 소비를 추구하는 소비자가 증가하고 있으며, ESG 수출 장벽이 강화되는 추세입니다. 하지만 중소기업은 ESG 경영 전환에 애로사항이 있다는 보고서를 읽었고, 저는 중소벤처기업의 글로벌 경쟁력 강화에 도움이 되고자 정책 아이디어 공모전에 출전했습니다.중소기업이 ESG 경영에 있어 가장 필요하지만 어려운 점이 ‘친환경 패키지’라는 것을 파악해 ‘친환경 패키지 바우처 지원’의 아이디어를 구상했습니다. 제조 중소기업과 친환경 패키지 중소기업을 연결하여 상생협력 구축 체계를 만들고, 해외 진출을 도울 수 있는 아이디어를 제시했습니다. 아이디어는 구체적이고 실천 가능성이 높다는 피드백을 받으며 대상을 수상했습니다.저는 니즈 파악부터 개선 방안 기획까지의 과정에서 ‘분석적 사고’라는 직무 역량을 만들었습니다. 앞으로도 창의성을 바탕으로 개선 방안을 제시하고, 기업과 국민의 행복을 더하는 직원이 되겠습니다.";

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
const originalStartIndex = 317;  // 원래 시작점 (잘못된 위치)
const originalEndIndex = 384;    // 원래 끝점

// ✅ 인덱스 조정 실행
const adjustedClue = adjustIndices(answer1, originalStartIndex, originalEndIndex);

// ✅ 조정된 인덱스를 사용하여 텍스트 추출
const extractedText = answer1.slice(adjustedClue.start_index, adjustedClue.end_index + 1);

console.log("📌 조정된 start_index:", adjustedClue.start_index);
console.log("📌 조정된 end_index:", adjustedClue.end_index);
console.log("📌 추출된 근거 텍스트:", extractedText);
