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
                let indexOffset = 0;  // ✅ 인덱스 밀림 방지

                // ✅ 중복 방지를 위한 밑줄 범위 조정
                let mergedClues = [];
                let currentStart = null;
                let currentEnd = null;

                coverLetter.questions
                    .sort((a, b) => a.clue_indices.start_index - b.clue_indices.start_index)
                    .forEach((q, index) => {
                        let startIdx = q.clue_indices.start_index + indexOffset;
                        let endIdx = q.clue_indices.end_index + indexOffset;

                        const questionMarker = `(${index + 1})`;
                        originalText = originalText.slice(0, startIdx) + questionMarker + originalText.slice(startIdx);
                        indexOffset += questionMarker.length;

                        // ✅ 겹치는 범위를 합치기
                        if (currentStart === null) {
                            currentStart = startIdx;
                            currentEnd = endIdx;
                        } else if (startIdx <= currentEnd) {
                            currentEnd = Math.max(currentEnd, endIdx);
                        } else {
                            mergedClues.push({ start: currentStart, end: currentEnd });
                            currentStart = startIdx;
                            currentEnd = endIdx;
                        }
                    });

                if (currentStart !== null) {
                    mergedClues.push({ start: currentStart, end: currentEnd });
                }

                coverLetter.questions.forEach((q, index) => {
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

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "600px" }}>
                <h2>🛒 질문 카트</h2>
                <p>현재 저장된 지원자 수: {new Set(cartItems.map(item => item.key_number)).size}</p>

                <button onClick={handleDownloadExcel} style={{ marginTop: "10px", backgroundColor: "green", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>📥 Excel 다운로드</button>
                <button onClick={onClose} style={{ marginTop: "10px", backgroundColor: "gray", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>닫기</button>
            </div>
        </div>
    );
};

export default CartModal;
