import React, { useState } from "react";
import DataTable from "./components/DataTable";
import ResultChart from "./components/ResultChart";
import { getRegression } from "./services/api";

export default function App() {
  const [rows, setRows] = useState([{ x: "", y: "", error: "" }]);
  const [power, setPower] = useState(1);
  const [params, setParams] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);
  const [fitCurve, setFitCurve] = useState([]);

  const handleCellChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  const addRow = () => setRows([...rows, { x: "", y: "", error: "" }]);
  const removeRow = idx => rows.length > 1 && setRows(rows.filter((_, i) => i !== idx));

  async function handleSubmit(e) {
    e.preventDefault();
    const xNums = [], yNums = [], dyNums = [];
    for (let { x, y, error } of rows) {
      if (x === "" || y === "") {
        alert("All rows must have X and Y values.");
        return;
      }
      xNums.push(Number(x));
      yNums.push(Number(y));
      dyNums.push(error === "" ? 0 : Number(error));
    }

    try {
      // Call API with power
      const { params, fit_x, fit_y } = await getRegression({ x: xNums, y: yNums, power });
      setParams(params);

      // Scatter points
      const pts = xNums.map((xi, i) => ({ x: xi, y: yNums[i], error: dyNums[i] }));
      setDataPoints(pts);

      // Fit curve points
      const curve = fit_x.map((xi, i) => ({ x: xi, y: fit_y[i] }));
      setFitCurve(curve);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ width: 320, padding: "1rem", borderRight: "1px solid #ddd", overflowY: "auto", boxSizing: "border-box" }}>
        <h2>Data Table</h2>
        <DataTable
          rows={rows}
          handleCellChange={handleCellChange}
          addRow={addRow}
          removeRow={removeRow}
          power={power}
          onPowerChange={setPower}
          handleSubmit={handleSubmit}
        />
      </div>
      <div style={{ flex: 1, padding: "1rem", boxSizing: "border-box", overflow: "hidden" }}>
        <ResultChart
          params={params}
          dataPoints={dataPoints}
          fitCurve={fitCurve}
          power={power}
        />
      </div>
    </div>
  );
}
