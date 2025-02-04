import React from "react";

const JsonModal = ({ isOpen, onClose, jsonData }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", 
            top: "10%", 
            left: "10%", 
            width: "80%",  // ✅ width 80%로 확대
            height: "80%", // ✅ height 80%로 확대
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center"
        }}>
            <div style={{
                  backgroundColor: "white", 
                  padding: "20px", 
                  borderRadius: "10px", 
                  width: "100%",   // ✅ 내부 컨텐츠도 100% 활용
                  height: "100%",  // ✅ 내부 컨텐츠도 100% 활용
                  overflow: "auto" // ✅ 스크롤 가능하게
            }}>
                <h3>📜 API에 보내질 JSON 데이터</h3>
                <pre style={{
                    flex: 1, overflow: "auto", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px",
                    whiteSpace: "pre-wrap", wordWrap: "break-word"
                }}>
                    {JSON.stringify(jsonData, null, 2)}
                </pre>
                <button onClick={onClose} style={{
                    marginTop: "10px", padding: "10px", backgroundColor: "#007bff", color: "white",
                    border: "none", cursor: "pointer", borderRadius: "5px"
                }}>
                    닫기
                </button>
            </div>
        </div>
    );
};

export default JsonModal;
