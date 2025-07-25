import React from "react";

export default function DataTable({
  rows,
  handleCellChange,
  addRow,
  removeRow,
  power,
  onPowerChange,
  handleSubmit,
  isLoading
}) {
  return (
    <form onSubmit={handleSubmit} className="data-form">
      {/* Polynomial Power Section */}
      <div className="form-section">
        <h4>🔢 Regression Parameters</h4>
        <div style={{ marginBottom: "8px" }}>
          <label style={{ fontSize: "12px", color: "#5a6c7d", display: "block", marginBottom: "4px" }}>
            Polynomial Degree (Power):
          </label>
          <input
            type="number"
            value={power}
            onChange={e => onPowerChange(parseInt(e.target.value, 10) || 0)}
            className="power-input"
            min="-10"
            max="10"
            placeholder="Enter power (-10 to 10)"
          />
        </div>
        <div style={{ fontSize: "11px", color: "#7f8c8d", lineHeight: "1.4" }}>
          <strong>Examples:</strong><br/>
          • Power = 1: Linear (y = ax + b)<br/>
          • Power = 2: Quadratic (y = ax² + bx + c)<br/>
          • Power = -1: Inverse (y = a/x + b)
        </div>
      </div>

      {/* Data Input Section */}
      <div className="form-section">
        <h4>📊 Data Points</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>X Value</th>
              <th>Y Value</th>
              <th>±Y Error</th>
              <th style={{ width: "40px" }}>❌</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="number"
                    step="any"
                    value={row.x}
                    onChange={e => handleCellChange(i, 'x', e.target.value)}
                    className="table-input"
                    placeholder="X"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="any"
                    value={row.y}
                    onChange={e => handleCellChange(i, 'y', e.target.value)}
                    className="table-input"
                    placeholder="Y"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="any"
                    value={row.error}
                    onChange={e => handleCellChange(i, 'error', e.target.value)}
                    className="table-input"
                    placeholder="±"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="remove-btn"
                    title="Remove this row"
                    disabled={rows.length <= 1}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          type="button" 
          onClick={addRow} 
          className="btn btn-secondary"
        >
          ➕ Add Data Point
        </button>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>🔄 Computing...</>
          ) : (
            <>📈 Analyze & Plot</>
          )}
        </button>
      </div>

      {/* Statistics Panel (if data exists) */}
      {rows.some(row => row.x !== "" && row.y !== "") && (
        <div className="form-section">
          <h4>📊 Data Statistics</h4>
          <div style={{ fontSize: "11px", color: "#5a6c7d", lineHeight: "1.6" }}>
            {(() => {
              const validRows = rows.filter(row => row.x !== "" && row.y !== "");
              const xValues = validRows.map(row => parseFloat(row.x)).filter(x => !isNaN(x));
              const yValues = validRows.map(row => parseFloat(row.y)).filter(y => !isNaN(y));
              
              if (xValues.length === 0) return "No valid data points";
              
              const xMin = Math.min(...xValues);
              const xMax = Math.max(...xValues);
              const yMin = Math.min(...yValues);
              const yMax = Math.max(...yValues);
              const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
              const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
              
              return (
                <>
                  <strong>X Range:</strong> {xMin.toFixed(3)} to {xMax.toFixed(3)}<br/>
                  <strong>Y Range:</strong> {yMin.toFixed(3)} to {yMax.toFixed(3)}<br/>
                  <strong>X Mean:</strong> {xMean.toFixed(3)} | <strong>Y Mean:</strong> {yMean.toFixed(3)}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div style={{ 
        fontSize: "11px", 
        color: "#7f8c8d", 
        textAlign: "center",
        padding: "8px",
        background: "#f8f9fb",
        border: "1px solid #e1e8ed",
        borderRadius: "4px"
      }}>
        📋 {rows.filter(row => row.x !== "" && row.y !== "").length} valid data points
      </div>
    </form>
  );
}