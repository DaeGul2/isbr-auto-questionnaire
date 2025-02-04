import React from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

const CartModal = ({ isOpen, onClose, cartItems, setCartItems }) => {
    if (!isOpen) return null;
    console.log(cartItems);

    // ✅ Excel 다운로드 함수
    const handleDownloadExcel = async () => {
        if (cartItems.length === 0) {
            alert("카트에 저장된 질문이 없습니다.");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("GPT_Questions");

        // ✅ 엑셀 헤더 정의
        worksheet.columns = [
            { header: "지원자_ID", key: "지원자_ID", width: 15 },
            { header: "자소서_ID", key: "자소서_ID", width: 10 },
            { header: "질문번호", key: "질문번호", width: 10 },
            { header: "질문", key: "질문", width: 50 },
            { header: "근거", key: "근거", width: 50 },
            { header: "원본", key: "원본", width: 100 }
        ];

        cartItems.forEach(item => {
            item.cover_letters.forEach(coverLetter => {
                let isFirstQuestion = true;
                let originalText = coverLetter.originalText;
                let indexOffset = 0;

                // ✅ 중복 방지를 위한 밑줄 범위 조정
                let mergedClues = [];
                let currentStart = null;
                let currentEnd = null;

                // ✅ 번호 삽입 후 start_index, end_index 보정
                let updatedQuestions = coverLetter.questions
                    .sort((a, b) => a.clue_indices.start_index - b.clue_indices.start_index)
                    .map((q, index) => {
                        let startIdx = q.clue_indices.start_index + indexOffset;
                        let endIdx = q.clue_indices.end_index + indexOffset;
                        const questionMarker = `(${index + 1})`;

                        // ✅ 원본 텍스트에 번호 삽입
                        originalText = originalText.slice(0, startIdx) + questionMarker + originalText.slice(startIdx);

                        // ✅ 인덱스 보정 (삽입한 문자 길이 반영)
                        indexOffset += questionMarker.length;

                        return {
                            ...q,
                            clue_indices: {
                                start_index: startIdx,
                                end_index: endIdx + questionMarker.length
                            }
                        };
                    });

                // ✅ 근거 구역 병합
                updatedQuestions.forEach(q => {
                    let { start_index, end_index } = q.clue_indices;
                    if (currentStart === null) {
                        currentStart = start_index;
                        currentEnd = end_index;
                    } else if (start_index <= currentEnd) {
                        currentEnd = Math.max(currentEnd, end_index);
                    } else {
                        mergedClues.push({ start: currentStart, end: currentEnd });
                        currentStart = start_index;
                        currentEnd = end_index;
                    }
                });

                if (currentStart !== null) {
                    mergedClues.push({ start: currentStart, end: currentEnd });
                }

                updatedQuestions.forEach((q, index) => {
                    let row = worksheet.addRow({
                        "지원자_ID": isFirstQuestion ? item.key_number : "",
                        "자소서_ID": isFirstQuestion ? coverLetter.cover_letter_id : "",
                        "질문번호": index + 1,
                        "질문": `(${index + 1}) ${q.question}`,
                        "근거": originalText.slice(q.clue_indices.start_index, q.clue_indices.end_index + 1)
                    });

                    // ✅ 원본 텍스트 일부만 밑줄 적용
                    if (isFirstQuestion) {
                        let richText = [];
                        let lastIndex = 0;

                        mergedClues.forEach(({ start, end }) => {
                            if (lastIndex < start) {
                                richText.push({ text: originalText.slice(lastIndex, start) });
                            }

                            richText.push({
                                text: originalText.slice(start, end + 1),
                                font: { underline: true }
                            });

                            lastIndex = end + 1;
                        });

                        if (lastIndex < originalText.length) {
                            richText.push({ text: originalText.slice(lastIndex) });
                        }

                        row.getCell("원본").value = { richText };
                    }

                    isFirstQuestion = false;
                });
            });
        });

        // ✅ 엑셀 파일 다운로드
        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = prompt("저장할 파일명을 입력하세요", "GPT_Questions.xlsx");
        if (fileName) {
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }
    };

    // ✅ 질문 개별 삭제 기능
    const handleRemoveQuestion = (key_number, cover_letter_id, questionIndex) => {
        if (!setCartItems) return;
        const updatedCart = cartItems
            .map(item => {
                if (item.key_number === key_number) {
                    return {
                        ...item,
                        cover_letters: item.cover_letters
                            .map(coverLetter => {
                                if (coverLetter.cover_letter_id === cover_letter_id) {
                                    const updatedQuestions = coverLetter.questions.filter((_, index) => index !== questionIndex);
                                    return updatedQuestions.length > 0 ? { ...coverLetter, questions: updatedQuestions } : null;
                                }
                                return coverLetter;
                            })
                            .filter(Boolean)
                    };
                }
                return item;
            })
            .filter(item => item.cover_letters.length > 0);
        setCartItems(updatedCart);
    };

    return (
        <div className="modal-container">
            <div className="modal-content">
                <h2>🛒 질문 카트</h2>
                <p>현재 저장된 지원자 수: {new Set(cartItems.map(item => item.key_number)).size}</p>

                {/* ✅ 카트 내용 표시 UI */}
                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                    {cartItems.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: "15px" }}>
                            <h3>🆔 지원자 ID: {item.key_number}</h3>
                            {item.cover_letters.map((coverLetter, cIdx) => (
                                <div key={cIdx} style={{ padding: "10px", backgroundColor: "#f8f8f8", borderRadius: "5px", marginBottom: "10px" }}>
                                    <h4>📄 자기소개서 {coverLetter.cover_letter_id}</h4>
                                    {coverLetter.questions.map((q, qIdx) => (
                                        <div key={qIdx} style={{ padding: "8px", backgroundColor: "#e6f7ff", borderRadius: "5px", marginBottom: "8px", position: "relative" }}>
                                            <button onClick={() => handleRemoveQuestion(item.key_number, coverLetter.cover_letter_id, qIdx)}
                                                style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "red", color: "white", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }}>
                                                ❌
                                            </button>
                                            <p><strong>✅ 질문:</strong> {q.question}</p>
                                            <p><strong>🔍 근거:</strong> {coverLetter.originalText.slice(q.clue_indices.start_index, q.clue_indices.end_index + 1)}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <button onClick={handleDownloadExcel}>📥 Excel 다운로드</button>
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default CartModal;
