import React from "react";
import { useState } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { uploadExcelAndGeneratePPT, downloadPPT } from "../services/flaskService"; // ✅ Flask API

const CartModal = ({ isOpen, onClose, cartItems, setCartItems }) => {

    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ 파일 업로드 핸들러
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const [idToText, setIdToText] = useState({
        1: "",
        2: "",
        3: "",
        4: ""
    }); 
    if (!isOpen) return null;
    console.log(cartItems);

    // ✅ 사용자에게 질문 입력받기
    const handlePromptForQuestions = () => {
        return new Promise((resolve) => {
            let updatedIdToText = { ...idToText };
            for (let i = 1; i <= 4; i++) {
                const userInput = prompt(`자소서 ${i}에 해당하는 질문을 입력하세요:`, updatedIdToText[i]);
                if (userInput !== null) {
                    updatedIdToText[i] = userInput;
                }
            }
            setIdToText(updatedIdToText);
            resolve(updatedIdToText);
        });
    };
    // ✅ Excel 생성 및 Flask 서버로 업로드
    // ✅ Excel 생성 및 Flask 서버로 업로드
    const handleUploadAndGeneratePPT = async () => {
        try {
            setIsLoading(true);
            const updatedIdToText = await handlePromptForQuestions();
    
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("GPT_Questions");
    
            worksheet.columns = [
                { header: "지원자_ID", key: "지원자_ID", width: 15 },
                { header: "자소서_ID", key: "자소서_ID", width: 10 },
                { header: "질문", key: "질문", width: 50 },
                { header: "근거", key: "근거", width: 50 },
                { header: "원본", key: "원본", width: 100 },
                { header: "밑줄_인덱스", key: "밑줄_인덱스", width: 30 }
            ];
    
            // ✅ 엑셀 데이터 생성
            cartItems.forEach(item => {
                item.cover_letters.forEach(coverLetter => {
                    let isFirstQuestion = true;
                    let originalText = coverLetter.originalText;
                    let mergedClues = [];
    
                    coverLetter.questions.forEach((q, index) => {
                        worksheet.addRow({
                            "지원자_ID": isFirstQuestion ? item.key_number : "",
                            "자소서_ID": isFirstQuestion ? coverLetter.cover_letter_id : "",
                            "질문": `(${index + 1}) ${q.question}`,
                            "근거": originalText.slice(q.clue_indices.start_index, q.clue_indices.end_index + 1),
                            "밑줄_인덱스": JSON.stringify(mergedClues)
                        });
    
                        isFirstQuestion = false;
                    });
                });
            });
    
            // ✅ 파일 생성 (File 객체로 변환하여 이름 설정)
            const buffer = await workbook.xlsx.writeBuffer();
            
    
            // ✅ Flask 서버로 전송
            const response = await uploadExcelAndGeneratePPT(file, updatedIdToText);
    
            if (response.ppt_url) {
                downloadPPT(response.ppt_url);
            } else {
                alert("❌ PPT 생성 실패");
            }
        } catch (error) {
            console.error("❌ 서버 오류:", error);
            alert("❌ 서버에서 오류 발생");
        } finally {
            setIsLoading(false);
        }
    };

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
            { header: "질문", key: "질문", width: 50 },
            { header: "근거", key: "근거", width: 50 },
            { header: "원본", key: "원본", width: 100 },
            { header: "밑줄 인덱스", key: "밑줄_인덱스", width: 30 } // ✅ 밑줄 범위 저장
        ];

        cartItems.forEach(item => {
            item.cover_letters.forEach(coverLetter => {
                let isFirstRow = true;
                let originalText = coverLetter.originalText;
                let indexOffset = 0;

                // ✅ 질문과 근거를 개행으로 묶음
                let questionTexts = [];
                let evidenceTexts = [];

                // ✅ 밑줄 범위 병합
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

                        // ✅ 질문과 근거 배열에 추가
                        questionTexts.push(`(${index + 1}) ${q.question}`);
                        evidenceTexts.push(originalText.slice(startIdx, endIdx + questionMarker.length));

                        return {
                            ...q,
                            clue_indices: {
                                start_index: startIdx,
                                end_index: endIdx + questionMarker.length
                            }
                        };
                    });

                // ✅ 밑줄 범위 병합
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

                // ✅ 한 행에 모든 질문과 근거를 넣음
                let row = worksheet.addRow({
                    "지원자_ID": item.key_number,
                    "자소서_ID": coverLetter.cover_letter_id,
                    "질문": questionTexts.join("\n"), // ✅ 개행으로 묶음
                    "근거": evidenceTexts.join("\n"), // ✅ 개행으로 묶음
                    "밑줄_인덱스": isFirstRow ? JSON.stringify(mergedClues) : "" // ✅ 첫 번째 행에만 저장
                });

                // ✅ 원본 텍스트 일부만 밑줄 적용
                if (isFirstRow) {
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
                <div>
                    <h3>📂 엑셀 파일 업로드</h3>
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                </div>
                <button onClick={handleDownloadExcel}>📥 Excel 다운로드</button>
                <button
                    onClick={handleUploadAndGeneratePPT}
                    style={{ marginTop: "10px", backgroundColor: "blue", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}
                >
                    📤 PPT 생성 및 다운로드
                </button>
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default CartModal;
