import React from "react";
import { useTable } from "react-table";

const DataTable = ({ columns, data, setData, keyColumn, selectedColumns, setSelectedColumns, selectedRows, setSelectedRows, setHeaders }) => {
    const handleInputChange = (rowIndex, columnId, value) => {
        const updatedData = [...data];
        updatedData[rowIndex][columnId] = value;
        setData(updatedData);
    };

    const handleColumnToggle = (columnId) => {
        setSelectedColumns((prev) => 
            prev.includes(columnId) ? prev.filter((col) => col !== columnId) : [...prev, columnId]
        );
    };

    const handleRowToggle = (rowIndex) => {
        setSelectedRows((prev) =>
            prev.includes(rowIndex) ? prev.filter((row) => row !== rowIndex) : [...prev, rowIndex]
        );
    };

    // ✅ 열 삭제 기능
    const handleColumnDelete = (columnId) => {
        const updatedHeaders = columns.filter(col => col.accessor !== columnId).map(col => col.accessor);
        const updatedData = data.map(row => {
            const newRow = { ...row };
            delete newRow[columnId];
            return newRow;
        });

        setHeaders(updatedHeaders);
        setData(updatedData);
    };

    // ✅ 행 삭제 기능
    const handleRowDelete = (rowIndex) => {
        const updatedData = data.filter((_, index) => index !== rowIndex);
        setData(updatedData);
    };

    const tableInstance = useTable({ columns, data });

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

    return (
        <table {...getTableProps()} border="1" style={{ width: "100%", marginTop: "10px" }}>
            <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {/* 컬럼 선택 체크박스 */}
                        <th></th>
                        {headerGroup.headers.map((column) => (
                            <th
                                {...column.getHeaderProps()}
                                style={{
                                    backgroundColor: column.id === keyColumn ? "#add8e6" : selectedColumns.includes(column.id) ? "#90ee90" : "white",
                                    padding: "8px",
                                    textAlign: "left",
                                    position: "relative"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedColumns.includes(column.id)}
                                    onChange={() => handleColumnToggle(column.id)}
                                />
                                {column.render("Header")}
                                {/* 컬럼 삭제 버튼 */}
                                <button 
                                    onClick={() => handleColumnDelete(column.id)} 
                                    style={{
                                        position: "absolute",
                                        right: "5px",
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "2px 6px",
                                        fontSize: "12px"
                                    }}>
                                    X
                                </button>
                            </th>
                        ))}
                        <th>삭제</th> {/* 행 삭제 버튼 컬럼 */}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {/* 행 선택 체크박스 */}
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(i)}
                                    onChange={() => handleRowToggle(i)}
                                />
                            </td>
                            {row.cells.map((cell) => (
                                <td
                                    {...cell.getCellProps()}
                                    style={{
                                        backgroundColor: cell.column.id === keyColumn ? "#add8e6" : selectedColumns.includes(cell.column.id) ? "#90ee90" : "white",
                                        padding: "6px",
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={cell.value}
                                        onChange={(e) =>
                                            handleInputChange(i, cell.column.id, e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            backgroundColor: "transparent",
                                        }}
                                    />
                                </td>
                            ))}
                            {/* 행 삭제 버튼 */}
                            <td>
                                <button
                                    onClick={() => handleRowDelete(i)}
                                    style={{
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "2px 6px",
                                        fontSize: "12px"
                                    }}>
                                    X
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default DataTable;
