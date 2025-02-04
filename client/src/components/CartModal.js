import React from "react";
import * as XLSX from "xlsx";

const CartModal = ({ isOpen, onClose, cartItems, setCartItems }) => {
    if (!isOpen) return null;

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
                    근거: q.clue_text // ✅ 슬라이싱된 근거 텍스트만 포함
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
                        <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                            <h3>🆔 지원자 ID: <span style={{ fontWeight: "bold", color: "#0073e6" }}>{item.key_number}</span></h3>
                            {item.cover_letters.map((coverLetter, cIndex) => (
                                <div key={cIndex} style={{ padding: "10px", backgroundColor: "#ffffff", borderRadius: "6px", marginBottom: "10px", border: "1px solid #ccc" }}>
                                    <h4>📄 자기소개서 {coverLetter.cover_letter_id}</h4>
                                    {coverLetter.questions.map((q, qIndex) => (
                                        <div key={qIndex} style={{ marginBottom: "10px", padding: "12px", backgroundColor: "#e6f7ff", borderRadius: "5px" }}>
                                            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#0073e6" }}>✅ 질문:</p>
                                            <p style={{ fontSize: "14px", marginBottom: "8px" }}>{q.question}</p>
                                            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#0073e6" }}>🔍 근거:</p>
                                            <p style={{ fontSize: "14px", backgroundColor: "#f0f0f0", padding: "8px", borderRadius: "5px" }}>{q.clue_text}</p>
                                            <button 
                                                onClick={() => handleRemoveQuestion(item.key_number, coverLetter.cover_letter_id, qIndex)} 
                                                style={{ marginTop: "8px", backgroundColor: "#ff4d4d", color: "white", padding: "6px 12px", borderRadius: "5px", width: "100%", border: "none", cursor: "pointer" }}
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

                <button onClick={handleDownloadExcel} style={{ marginTop: "10px", backgroundColor: "green", color: "white", padding: "10px", borderRadius: "5px", width: "100%", fontSize: "16px" }}>📥 Excel 다운로드</button>
                <button onClick={onClose} style={{ marginTop: "10px", backgroundColor: "gray", color: "white", padding: "10px", borderRadius: "5px", width: "100%", fontSize: "16px" }}>닫기</button>
            </div>
        </div>
    );
};

export default CartModal;
