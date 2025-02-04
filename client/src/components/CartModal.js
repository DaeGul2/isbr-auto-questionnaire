import React from "react";
import * as XLSX from "xlsx";

const CartModal = ({ isOpen, onClose, cartItems }) => {
    if (!isOpen) return null;

    console.log("🛒 현재 카트에 담긴 전체 데이터:", cartItems); // ✅ 콘솔 디버깅용 전체 데이터 출력

    const handleDownloadExcel = () => {
        if (cartItems.length === 0) {
            alert("카트에 저장된 질문이 없습니다.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(cartItems);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GPT_Questions");

        const fileName = prompt("저장할 파일명을 입력하세요", "GPT_Questions.xlsx");
        if (fileName) {
            XLSX.writeFile(workbook, fileName);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "500px" }}>
                <h2>🛒 질문 카트</h2>
                <p>현재 저장된 지원자 수: {new Set(cartItems.map(item => item.key_number)).size}</p>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {cartItems.map((item, index) => (
                        <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "5px" }}>
                            <strong>지원자 ID: {item.key_number || "❌ 없음"}</strong> {/* ✅ key_number가 없을 경우 대비 */}
                            {Object.entries(item).map(([key, value]) => (
                                key !== "key_number" && <p key={key}><strong>{key}:</strong> {value}</p>
                            ))}
                        </div>
                    ))}
                </div>

                <button onClick={handleDownloadExcel} style={{ marginTop: "10px", backgroundColor: "green", color: "white" }}>📥 Excel 다운로드</button>
                <button onClick={onClose} style={{ marginTop: "10px", marginLeft: "10px" }}>닫기</button>
            </div>
        </div>
    );
};

export default CartModal;
