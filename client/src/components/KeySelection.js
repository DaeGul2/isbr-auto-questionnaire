import React, { useState } from "react";

const KeySelection = ({ headers, setKeyColumn, generateKeyColumn }) => {
    const [selectedKey, setSelectedKey] = useState("");

    const handleSelectChange = (event) => {
        const key = event.target.value;
        setSelectedKey(key);
        setKeyColumn(key);
    };

    return (
        <div style={{ padding: "10px", backgroundColor: "#add8e6", borderRadius: "5px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold" }}>🔑 키값 선택: </label>
            <select value={selectedKey} onChange={handleSelectChange}>
                <option value="">키값 선택</option>
                {headers.map((header, index) => (
                    <option key={index} value={header}>
                        {header}
                    </option>
                ))}
            </select>
            <button onClick={generateKeyColumn} style={{ marginLeft: "10px", padding: "5px" }}>
                키값 자동 생성
            </button>
        </div>
    );
};

export default KeySelection;
