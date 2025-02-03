import React from "react";
import * as XLSX from "xlsx";

const FileUpload = ({ onFileUpload }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            let headers = jsonData[0]; // 첫 번째 행이 헤더 (컬럼명)
            let rows = jsonData.slice(1);

            // ✅ 중복 컬럼명 해결 로직 추가
            const uniqueHeaders = {};
            headers = headers.map((header) => {
                if (!uniqueHeaders[header]) {
                    uniqueHeaders[header] = 1;
                    return header;
                } else {
                    uniqueHeaders[header] += 1;
                    return `${header}_${uniqueHeaders[header]}`; // 중복되면 _2, _3 형태로 변경
                }
            });

            // ✅ 새로운 헤더를 기반으로 데이터 매핑
            rows = rows.map((row) => {
                let rowData = {};
                headers.forEach((header, i) => {
                    rowData[header] = row[i] || ""; // 데이터가 없으면 빈 값 처리
                });
                return rowData;
            });

            onFileUpload(headers, rows);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>
    );
};

export default FileUpload;
