import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import KeySelection from "./components/KeySelection";
import JsonModal from "./components/JsonModal";
import CartModal from "./components/CartModal";
import { sendPrompt } from "./services/apiService";
import { parseGPTResponse } from "./utils/parseGPTResponse";

function App() {
    const [headers, setHeaders] = useState([]);
    const [data, setData] = useState([]);
    const [keyColumn, setKeyColumn] = useState("");
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [secretPassword, setSecretPassword] = useState("");
    const [responses, setResponses] = useState({});
    const [parsedResponses, setParsedResponses] = useState({});
    const [userRequest, setUserRequest] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jsonData, setJsonData] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleFileUpload = (headers, rows) => {
        setHeaders(headers);
        setData(rows);
    };

    const generateKeyColumn = () => {
        if (headers.includes("키값")) return;

        const updatedData = data.map((row, index) => ({
            "키값": index + 1,
            ...row,
        }));

        setHeaders(["키값", ...headers]);
        setData(updatedData);
        setKeyColumn("키값");
    };

    const handleSendPrompt = async () => {
        if (!secretPassword.trim()) {
            alert("비밀번호를 입력하세요!");
            return;
        }

        if (selectedColumns.length === 0 || selectedRows.length === 0) {
            alert("보낼 컬럼과 행을 최소 하나 이상 선택하세요!");
            return;
        }

        setIsLoading(true);
        setProgress(0);
        const totalRequests = selectedRows.length;
        const newResponses = {};
        const newParsedResponses = {};

        for (let i = 0; i < totalRequests; i++) {
            const rowIndex = selectedRows[i];
            const selectedRow = { key_number: data[rowIndex][keyColumn] };
            selectedColumns.forEach((col) => {
                selectedRow[col] = data[rowIndex][col];
            });

            try {
                const result = await sendPrompt(selectedRow, userRequest, secretPassword);
                newResponses[rowIndex] = result.message;

                // ✅ 응답 파싱
                newParsedResponses[rowIndex] = parseGPTResponse(result.message);
            } catch (error) {
                newResponses[rowIndex] = "API 요청 오류 발생";
                newParsedResponses[rowIndex] = {};
            }

            setResponses({ ...newResponses });
            setParsedResponses({ ...newParsedResponses });

            // ✅ 진행률 업데이트
            setProgress(((i + 1) / totalRequests) * 100);
        }

        setIsLoading(false);
    };

    const handleShowJson = () => {
        if (selectedColumns.length === 0 || selectedRows.length === 0) {
            alert("보낼 컬럼과 행을 최소 하나 이상 선택하세요!");
            return;
        }

        const formattedData = selectedRows.map((rowIndex) => {
            const selectedRow = { key_number: data[rowIndex][keyColumn] };
            selectedColumns.forEach((col) => {
                selectedRow[col] = data[rowIndex][col];
            });
            return selectedRow;
        });

        setJsonData(formattedData);
        setIsModalOpen(true);
    };

    const addToCart = (responseData) => {
        if (cartItems.some(item => item.key_number === responseData.key_number)) {
            alert("이미 추가된 질문입니다!");
            return;
        }

        setCartItems([...cartItems, responseData]);
        alert("질문이 카트에 추가되었습니다!");
    };

    return (
        <div>
            <h1>엑셀 데이터 업로드 및 관리</h1>
            <FileUpload onFileUpload={handleFileUpload} />
            {headers.length > 0 && (
                <>
                    <KeySelection
                        headers={headers}
                        setKeyColumn={setKeyColumn}
                        generateKeyColumn={generateKeyColumn}
                    />
                    <DataTable
                        columns={headers.map(header => ({ Header: header, accessor: header }))}
                        data={data}
                        setData={setData}
                        keyColumn={keyColumn}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        setHeaders={setHeaders}
                    />

                    <div style={{ marginTop: "20px" }}>
                        <h3>📜 추가 요청 사항</h3>
                        <textarea
                            value={userRequest}
                            onChange={(e) => setUserRequest(e.target.value)}
                            rows="3"
                            cols="50"
                            placeholder="GPT에게 추가적으로 요청할 사항을 입력하세요..."
                        />
                    </div>

                    <div>
                        <input 
                            type="password" 
                            placeholder="API 비밀번호 입력" 
                            value={secretPassword} 
                            onChange={(e) => setSecretPassword(e.target.value)} 
                        />
                        <button onClick={handleSendPrompt} disabled={isLoading}>
                            {isLoading ? "GPT 요청 중..." : "GPT 요청 보내기"}
                        </button>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <button onClick={handleShowJson}>JSON 데이터 확인</button>
                    </div>

                    <JsonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} jsonData={jsonData} />

                    {isLoading && (
                        <div style={{ marginTop: "20px" }}>
                            <progress value={progress} max="100"></progress>
                            <p>{Math.round(progress)}% 완료</p>
                        </div>
                    )}

                    <h3>응답:</h3>
                    <div>
                        {selectedRows.map((rowIndex) => (
                            <div key={rowIndex} style={{
                                marginBottom: "10px",
                                padding: "10px",
                                border: "1px solid #ddd",
                                backgroundColor: "#f9f9f9",
                                borderRadius: "10px"
                            }}>
                                <strong>지원자 ID: {parsedResponses[rowIndex]?.key_number || "❌ 없음"}</strong> 
                                {parsedResponses[rowIndex] ? (
                                    <div>
                                        {Object.entries(parsedResponses[rowIndex]).map(([key, value]) => (
                                            key !== "key_number" && (
                                                <p key={key}><strong>{key}:</strong> {value}</p>
                                            )
                                        ))}
                                        <button 
                                            onClick={() => addToCart(parsedResponses[rowIndex])} 
                                            disabled={cartItems.some(item => item.key_number === parsedResponses[rowIndex].key_number)}
                                        >
                                            {cartItems.some(item => item.key_number === parsedResponses[rowIndex].key_number) 
                                                ? "✅ 추가됨" 
                                                : "➕ 카트에 추가"}
                                        </button>
                                    </div>
                                ) : (
                                    <span>응답 대기 중...</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button 
                        style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#007bff", color: "white" }}
                        onClick={() => setIsCartOpen(true)}
                    >
                        🛒 카트 ({cartItems.length})
                    </button>

                    <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} />
                </>
            )}
        </div>
    );
}

export default App;
