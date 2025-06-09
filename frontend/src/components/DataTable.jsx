import React from "react";

export default function DataTable({
  rows,
  handleCellChange,
  addRow,
  removeRow,
  power,
  onPowerChange,
  handleSubmit
}) {
  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {/* Exponent selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Exponent (power):
          <input
            type="number"
            value={power}
            onChange={e => onPowerChange(parseInt(e.target.value, 10) || 0)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.25rem",
              marginTop: "0.25rem"
            }}
          />
        </label>
      </div>

      {/* Data table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>X</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Y</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>ΔY</th>
            <th style={{ borderBottom: "1px solid #ccc" }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {['x', 'y', 'error'].map(field => (
                <td key={field} style={{ padding: "0.25rem 0.5rem" }}>
                  <input
                    type="number"
                    step="any"
                    value={row[field]}
                    onChange={e => handleCellChange(i, field, e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.25rem" }}
                    required={field !== 'error'}
                  />
                </td>
              ))}
              <td style={{ padding: "0.25rem 0.5rem" }}>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#c00",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    lineHeight: "1"
                  }}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Row controls */}
      <div style={{ marginTop: "0.5rem" }}>
        <button type="button" onClick={addRow} style={{ padding: "0.3rem 0.6rem" }}>
          + Add Row
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        style={{
          marginTop: "1rem",
          padding: "0.6rem 1.2rem",
          fontWeight: "bold"
        }}
      >
        Compute & Plot
      </button>
    </form>
  );
}