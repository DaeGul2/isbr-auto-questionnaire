import React from "react";
import * as XLSX from "xlsx";

const CartModal = ({ isOpen, onClose, cartItems, setCartItems }) => {
    if (!isOpen) return null;

    // ✅ Excel 다운로드 함수 수정 (모든 지원자의 데이터를 포함하도록 수정)
    const handleDownloadExcel = () => {
        if (cartItems.length === 0) {
            alert("카트에 저장된 질문이 없습니다.");
            return;
        }

        const flattenedData = cartItems.flatMap(item => {
            return item.cover_letters.map(coverLetter => {
                return coverLetter.questions.map((q, index) => ({
                    지원자_ID: item.key_number,
                    자기소개서_번호: coverLetter.cover_letter_id,
                    질문번호: index + 1,
                    질문: q.question,
                    근거: q.clue  // ✅ Clue가 올바르게 표시되도록 처리
                }));
            });
        }).flat();

        const worksheet = XLSX.utils.json_to_sheet(flattenedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GPT_Questions");

        const fileName = prompt("저장할 파일명을 입력하세요", "GPT_Questions.xlsx");
        if (fileName) {
            XLSX.writeFile(workbook, fileName);
        }
    };

    // ✅ 개별 질문 삭제 함수
    const handleRemoveQuestion = (key_number, cover_letter_id, questionIndex) => {
        const updatedCart = cartItems.map(item => {
            if (item.key_number === key_number) {
                return {
                    ...item,
                    cover_letters: item.cover_letters.map(coverLetter => {
                        if (coverLetter.cover_letter_id === cover_letter_id) {
                            return {
                                ...coverLetter,
                                questions: coverLetter.questions.filter((_, index) => index !== questionIndex)
                            };
                        }
                        return coverLetter;
                    }).filter(coverLetter => coverLetter.questions.length > 0)
                };
            }
            return item;
        }).filter(item => item.cover_letters.length > 0);

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
                    {cartItems.map((item, index) => (
                        <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
                            <h3>🆔 지원자 ID: {item.key_number}</h3>
                            {item.cover_letters.map((coverLetter, cIndex) => (
                                <div key={cIndex} style={{ padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "6px", marginBottom: "10px" }}>
                                    <h4>📄 자기소개서 {coverLetter.cover_letter_id}</h4>
                                    {coverLetter.questions.map((q, qIndex) => (
                                        <div key={qIndex} style={{ marginBottom: "10px", padding: "8px", backgroundColor: "#e6f7ff", borderRadius: "5px", position: "relative" }}>
                                            <p><strong>✅ 질문:</strong> {q.question}</p>
                                            <p><strong>🔍 근거:</strong> {q.clue}</p>
                                            <button 
                                                onClick={() => handleRemoveQuestion(item.key_number, coverLetter.cover_letter_id, qIndex)} 
                                                style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "5px", padding: "4px 8px", cursor: "pointer" }}
                                            >
                                                ❌ 삭제
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <button onClick={handleDownloadExcel} style={{ marginTop: "10px", backgroundColor: "green", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>📥 Excel 다운로드</button>
                <button onClick={onClose} style={{ marginTop: "10px", backgroundColor: "gray", color: "white", padding: "10px", borderRadius: "5px", width: "100%" }}>닫기</button>
            </div>
        </div>
    );
};

export default CartModal;
