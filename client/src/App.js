import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import KeySelection from "./components/KeySelection";
import JsonModal from "./components/JsonModal"; // ✅ JSON 모달 추가
import { sendPrompt } from "./services/apiService";

function App() {
    const [headers, setHeaders] = useState([]);
    const [data, setData] = useState([]);
    const [keyColumn, setKeyColumn] = useState("");
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [secretPassword, setSecretPassword] = useState("");
    const [responses, setResponses] = useState({});
    const [userRequest, setUserRequest] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jsonData, setJsonData] = useState([]);

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
        const newResponses = { ...responses };

        for (const rowIndex of selectedRows) {
            const selectedRow = { key_number: data[rowIndex][keyColumn] }; // ✅ 식별번호 포함
            selectedColumns.forEach((col) => {
                selectedRow[col] = data[rowIndex][col];
            });

            try {
                const result = await sendPrompt(selectedRow, userRequest, secretPassword);
                newResponses[rowIndex] = result.message;
            } catch (error) {
                newResponses[rowIndex] = "API 요청 오류 발생";
            }

            setResponses({ ...newResponses });
        }

        setIsLoading(false);
    };

    // ✅ JSON 데이터 확인 버튼 클릭 시 모달에 데이터 저장 후 띄우기
    const handleShowJson = () => {
        if (selectedColumns.length === 0 || selectedRows.length === 0) {
            alert("보낼 컬럼과 행을 최소 하나 이상 선택하세요!");
            return;
        }

        const formattedData = selectedRows.map((rowIndex) => {
            const selectedRow = { key_number: data[rowIndex][keyColumn] }; // ✅ 식별번호 포함
            selectedColumns.forEach((col) => {
                selectedRow[col] = data[rowIndex][col];
            });
            return selectedRow;
        });

        setJsonData(formattedData);
        setIsModalOpen(true);
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

                    {/* ✅ 사용자가 직접 추가 요청을 입력할 수 있도록 UI 추가 */}
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

                    {/* ✅ JSON 데이터 확인 버튼 */}
                    <div style={{ marginTop: "10px" }}>
                        <button onClick={handleShowJson}>JSON 데이터 확인</button>
                    </div>

                    {/* ✅ JSON 데이터 모달 추가 */}
                    <JsonModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        jsonData={jsonData}
                    />

                    <h3>응답:</h3>
                    <div>
                        {selectedRows.map((rowIndex) => (
                            <div key={rowIndex} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd" }}>
                                <strong>지원자 {parseInt(rowIndex) + 1}:</strong> 
                                {responses[rowIndex] ? (
                                    <pre>{responses[rowIndex]}</pre>
                                ) : (
                                    <span>응답 대기 중...</span>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
