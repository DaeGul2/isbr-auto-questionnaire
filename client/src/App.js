import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import KeySelection from "./components/KeySelection";
import JsonModal from "./components/JsonModal";
import CartModal from "./components/CartModal";
import { sendPrompt } from "./services/apiService";
import { parseGPTResponse } from "./utils/parseGPTResponse";
import "./styles/theme.css";



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


    const [isExpanded, setIsExpanded] = useState({});
    const [isDetailVisible, setIsDetailVisible] = useState({}); // ✅ (지원자 ID + 자소서 ID) 기준으로 관리

    const toggleExpand = (id) => {
        setIsExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDetail = (applicantId, coverLetterId) => {
        const key = `${applicantId}-${coverLetterId}`; // ✅ 지원자 ID + 자소서 ID를 키로 사용
        setIsDetailVisible((prev) => ({ ...prev, [key]: !prev[key] }));
    };

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
        if (!keyColumn) {
            alert("❌ 키값을 선택해야 합니다!");
            return;
        }

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

            const coverLetterText = selectedColumns.map(col => data[rowIndex][col]);

            try {
                const result = await sendPrompt(selectedRow, userRequest, secretPassword);
                newResponses[rowIndex] = result.message;

                const parsedResult = parseGPTResponse(result.message, coverLetterText);
                newParsedResponses[rowIndex] = {
                    ...parsedResult,
                    originalText: coverLetterText  // 각 자기소개서의 원본 텍스트 저장
                };
            } catch (error) {
                newResponses[rowIndex] = "API 요청 오류 발생";
                newParsedResponses[rowIndex] = {};
            }

            setResponses({ ...newResponses });
            setParsedResponses({ ...newParsedResponses });
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

    const handleAddToCart = (parsedResponse) => {
        if (!parsedResponse || !parsedResponse.key_number) return;

        const isAlreadyAdded = cartItems.some(item => item.key_number === parsedResponse.key_number);
        if (isAlreadyAdded) {
            alert("이미 추가된 지원자의 질문입니다.");
            return;
        }
        console.log("parsed : ", parsedResponse);

        setCartItems([...cartItems, parsedResponse]);
        alert("질문이 카트에 추가되었습니다.");
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

                    {/* ✅ 프롬프트 입력 복원 */}
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

                    {/* ✅ 비밀번호 입력 및 요청 버튼 복원 */}
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

                    {/* ✅ JSON 미리보기 버튼 복원 */}
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

                    {/* ✅ 응답 카드 UI 개선 */}
                    <h3>응답:</h3>
                    <div>
                        {selectedRows.map((rowIndex) => {
                            const applicantId = parsedResponses[rowIndex]?.key_number || "N/A"; // ✅ 지원자 ID

                            return (
                                <div
                                    key={rowIndex}
                                    style={{
                                        marginBottom: "20px",
                                        padding: "15px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    {/* ✅ 지원자 ID 및 열기/닫기 버튼 */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center", // ✅ 버튼과 텍스트를 같은 높이로 정렬
                                            gap: "10px", // ✅ 간격 추가
                                        }}
                                    >
                                        <p>🆔 지원자 ID: {applicantId}</p>
                                        <button
                                            onClick={() => toggleExpand(rowIndex)}
                                            style={{
                                                backgroundColor: "#0073e6",
                                                color: "white",
                                                padding: "6px 10px",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {isExpanded[rowIndex] ? "닫기 ▲" : "열기 ▼"}
                                        </button>
                                        <button onClick={() => handleAddToCart(parsedResponses[rowIndex])} style={{ marginTop: "10px", backgroundColor: "#0073e6", color: "white" }}>
                                    🛒 카트에 추가
                                </button>
                                    </div>


                                    {isExpanded[rowIndex] &&
    parsedResponses[rowIndex]?.cover_letters.map((coverLetter, cIndex) => {
        const coverLetterId = coverLetter.cover_letter_id; // ✅ 자소서 ID
        const detailKey = `${applicantId}-${coverLetterId}`; // ✅ 고유한 키 생성
        const coverText = parsedResponses[rowIndex].originalText[cIndex];
        const isExpandedDetail = isDetailVisible[detailKey];

        return (
            <div
                key={cIndex}
                style={{
                    marginBottom: "10px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    display: "flex", // ✅ 좌우 배치 적용
                    gap: "20px", // ✅ 좌우 간격 추가
                    alignItems: "stretch", // ✅ 높이를 맞추기 위해 stretch 적용
                }}
            >
                {/* ✅ 왼쪽: 원본 자기소개서 (200자 제한) */}
                <div 
                    style={{ 
                        width: "50%", 
                        padding: "10px", 
                        display: "flex", 
                        flexDirection: "column",
                        flex: 1, // ✅ 높이를 자동으로 확장
                    }}
                >
                    <h4>📄 자기소개서 {coverLetterId}</h4>
                    <p>
                        <strong>원본 자기소개서:</strong>{" "}
                        {isExpandedDetail ? coverText : coverText.slice(0, 200)}
                        {!isExpandedDetail && coverText.length > 200 && (
                            <>
                                ...{" "}
                                <button
                                    onClick={() => toggleDetail(applicantId, coverLetterId)}
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "#0073e6",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }}
                                >
                                    [상세보기]
                                </button>
                            </>
                        )}
                        {isExpandedDetail && (
                            <>
                                {" "}
                                <button
                                    onClick={() => toggleDetail(applicantId, coverLetterId)}
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "#0073e6",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }}
                                >
                                    [축소보기]
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* ✅ 오른쪽: 질문 & 근거 리스트 (스크롤 적용) */}
                <div
                    style={{
                        width: "50%",
                        padding: "10px",
                        borderLeft: "2px solid #ddd", // ✅ 구분선 추가
                        overflowY: "auto", // ✅ 초과 시 스크롤 적용
                        display: "flex",
                        flexDirection: "column",
                        flex: 1, // ✅ 높이를 자동으로 확장
                        minHeight: "100%", // ✅ 높이 강제 설정
                    }}
                >
                    {coverLetter.questions.map((q, qIndex) => (
                        <div
                            key={qIndex}
                            style={{
                                marginBottom: "10px",
                                padding: "8px",
                                backgroundColor: "#e6f7ff",
                                borderRadius: "5px",
                            }}
                        >
                            <p>
                                <strong>✅ 질문{qIndex + 1}:</strong> {q.question}
                            </p>
                            <p>
                                <strong>🔍 근거:</strong>{" "}
                                {coverText.slice(Math.max(0, q.clue_indices.start_index), q.clue_indices.end_index + 1)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    })}


                                </div>
                            );
                        })}
                    </div>

                    {/* ✅ 카트 플로팅 버튼 추가 */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            right: "20px",
                            padding: "10px 15px",
                            backgroundColor: "#ff5722",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold"
                        }}
                    >
                        🛒 카트 보기
                    </button>

                    <CartModal
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        cartItems={cartItems}
                        setCartItems={setCartItems} // ✅ setCartItems를 전달
                    />
                </>
            )}
        </div>
    );
}

export default App;
