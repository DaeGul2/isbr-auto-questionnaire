import React from "react";
import * as XLSX from "xlsx";

const CartModal = ({ isOpen, onClose, cartItems, setCartItems }) => {

    if (!isOpen) return null;
    console.log(cartItems)
    // ✅ Excel 다운로드 함수 수정 (모든 지원자의 데이터를 포함하도록 수정)
    const handleDownloadExcel = () => {
        if (cartItems.length === 0) {
            alert("카트에 저장된 질문이 없습니다.");
            return;
        }

        // ✅ 엑셀 데이터 구조화 (지원자_ID → 자소서_ID 그룹화)
        const formattedData = [];
        const mergeRanges = [];  // 병합 범위 저장용
        let rowIndex = 1; // 엑셀 헤더 다음 행부터 시작 (엑셀은 1-based index)

        cartItems.forEach(item => {
            item.cover_letters.forEach(coverLetter => {
                let isFirstQuestion = true; // ✅ 첫 번째 질문 여부 확인
                let originalText = coverLetter.originalText; // 원본 자소서 텍스트
                let indexOffset = 0; // ✅ 인덱스 보정 값 (숫자 추가로 인한 밀림 방지)

                // ✅ 원본 텍스트에만 숫자 삽입 (근거에는 삽입 X)
                let modifiedOriginalText = originalText;
                coverLetter.questions.sort((a, b) => a.clue_indices.start_index - b.clue_indices.start_index)
                    .forEach((q, index) => {
                        let startIdx = q.clue_indices.start_index + indexOffset;  // ✅ 한 칸 뒤로 조정

                        const questionMarker = `(${index + 1})`;

                        // ✅ 원본 텍스트에 번호 삽입
                        modifiedOriginalText = modifiedOriginalText.slice(0, startIdx) + questionMarker + modifiedOriginalText.slice(startIdx);

                        // ✅ 인덱스 밀림 방지 (삽입된 문자열 길이만큼 오프셋 증가)
                        indexOffset += questionMarker.length;
                    });

                coverLetter.questions.forEach((q, index) => {
                    formattedData.push({
                        "지원자_ID": isFirstQuestion ? item.key_number : "",  // ✅ 같은 지원자는 첫 행에만 ID 추가
                        "자소서_ID": isFirstQuestion ? coverLetter.cover_letter_id : "", // ✅ 같은 자소서면 첫 행에만 ID 추가
                        "질문번호": index + 1,
                        "질문": q.question,
                        "근거": originalText.slice(Math.max(0, q.clue_indices.start_index), q.clue_indices.end_index + 1), // ✅ 근거는 원본 그대로
                        "원본": isFirstQuestion ? modifiedOriginalText : ""  // ✅ 원본은 첫 번째 행에만 추가
                    });

                    isFirstQuestion = false;
                });

                // ✅ 같은 지원자의 같은 자소서 그룹 병합을 위한 인덱스 계산
                if (coverLetter.questions.length > 1) {
                    const startRow = rowIndex;
                    const endRow = rowIndex + coverLetter.questions.length - 1;

                    // ✅ 지원자_ID 병합
                    mergeRanges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } });

                    // ✅ 자소서_ID 병합
                    mergeRanges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } });

                    // ✅ 원본 병합
                    mergeRanges.push({ s: { r: startRow, c: 5 }, e: { r: endRow, c: 5 } });
                }

                rowIndex += coverLetter.questions.length; // 다음 그룹 시작 위치 업데이트
            });
        });

        // ✅ 엑셀 생성 및 병합 처리
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GPT_Questions");

        // ✅ 병합 범위 추가
        worksheet["!merges"] = mergeRanges;

        const fileName = prompt("저장할 파일명을 입력하세요", "GPT_Questions.xlsx");
        if (fileName) {
            XLSX.writeFile(workbook, fileName);
        }
    };



    // ✅ 개별 질문 삭제 함수 (수정됨)
    const handleRemoveQuestion = (key_number, cover_letter_id, questionIndex) => {
        if (!setCartItems) {
            console.error("❌ setCartItems가 정의되지 않았습니다.");
            return;
        }

        const updatedCart = cartItems
            .map(item => {
                if (item.key_number === key_number) {
                    return {
                        ...item,
                        cover_letters: item.cover_letters
                            .map(coverLetter => {
                                if (coverLetter.cover_letter_id === cover_letter_id) {
                                    // ✅ 특정 질문만 삭제
                                    const updatedQuestions = coverLetter.questions.filter((_, index) => index !== questionIndex);

                                    // ✅ 자기소개서 내 질문이 0개라면, 자기소개서 자체를 삭제
                                    return updatedQuestions.length > 0 ? { ...coverLetter, questions: updatedQuestions } : null;
                                }
                                return coverLetter;
                            })
                            .filter(Boolean) // ✅ null인 자기소개서 필터링하여 삭제
                    };
                }
                return item;
            })
            .filter(item => item.cover_letters.length > 0); // ✅ 자기소개서가 모두 삭제된 지원자는 제거

        setCartItems(updatedCart);
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "600px" }}>
                <h2>🛒 질문 카트</h2>
                <p>현재 저장된 지원자 수: {new Set(cartItems.map(item => item.key_number)).size}</p>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {cartItems.length > 0 ? cartItems.map((item, index) => (
                        <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
                            <h3>🆔 지원자 ID: {item.key_number}</h3>
                            {item.cover_letters?.length > 0 ? item.cover_letters.map((coverLetter, cIndex) => (
                                <div key={cIndex} style={{ padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "6px", marginBottom: "10px" }}>
                                    <h4>📄 자기소개서 {coverLetter.cover_letter_id}</h4>
                                    {coverLetter.questions?.length > 0 ? coverLetter.questions.map((q, qIndex) => (
                                        <div key={qIndex} style={{ marginBottom: "10px", padding: "8px", backgroundColor: "#e6f7ff", borderRadius: "5px", position: "relative" }}>
                                            <p><strong>✅ 질문:</strong> {q.question}</p>
                                            <p><strong>🔍 근거:</strong> {coverLetter.originalText.slice(Math.max(0, q.clue_indices.start_index), q.clue_indices.end_index + 1)}</p>
                                            <button
                                                onClick={() => handleRemoveQuestion(item.key_number, coverLetter.cover_letter_id, qIndex)}
                                                style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "5px", padding: "4px 8px", cursor: "pointer" }}
                                            >
                                                ❌ 삭제
                                            </button>
                                        </div>
                                    )) : <p>No questions available.</p>}
                                </div>
                            )) : <p>No cover letters available.</p>}
                        </div>
                    )) : <p>No items in the cart.</p>}
                </div>

                <button onClick={handleDownloadExcel} style={{ marginTop: "10px", backgroundColor: "green", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>📥 Excel 다운로드</button>
                <button onClick={onClose} style={{ marginTop: "10px", backgroundColor: "gray", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>닫기</button>
            </div>
        </div>

    );
};

export default CartModal;
