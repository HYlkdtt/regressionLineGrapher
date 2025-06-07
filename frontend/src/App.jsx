// src/App.jsx
import React, { useState } from "react";
import DataTable from "./components/DataTable";
import ResultChart from "./components/ResultChart";
import { getRegression } from "./services/api";

export default function App() {
  const [rows, setRows] = useState([{ x: "", y: "", error: "" }]);
  const [result, setResult] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);
  const [lineData, setLineData] = useState([]);

  const handleCellChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { x: "", y: "", error: "" }]);
  };

  const removeRow = (idx) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const xNums = [];
    const yNums = [];
    const dyNums = [];

    for (let { x, y, error } of rows) {
      if (x === "" || y === "") {
        alert("All rows must have both X and Y values.");
        return;
      }
      xNums.push(Number(x));
      yNums.push(Number(y));
      dyNums.push(error === "" ? 0 : Number(error));
    }

    try {
      const { slope, intercept } = await getRegression({ x: xNums, y: yNums });
      setResult({ slope, intercept });

      const pts = xNums.map((xi, i) => ({ x: xi, y: yNums[i], error: dyNums[i] }));
      setDataPoints(pts);

      const minX = Math.min(...xNums);
      const maxX = Math.max(...xNums);
      setLineData([
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept }
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Left panel: Data table */}
      <div
        style={{
          width: 320,
          padding: "1rem",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          boxSizing: "border-box"
        }}
      >
        <h2>Data Table</h2>
        <DataTable
          rows={rows}
          handleCellChange={handleCellChange}
          addRow={addRow}
          removeRow={removeRow}
          handleSubmit={handleSubmit}
        />
      </div>

      {/* Right panel: Results & chart */}
      <div
        style={{
          flex: 1,
          padding: "1rem",
          boxSizing: "border-box",
          overflow: "hidden"
        }}
      >
        <ResultChart
          result={result}
          dataPoints={dataPoints}
          lineData={lineData}
        />
      </div>
    </div>
  );
}