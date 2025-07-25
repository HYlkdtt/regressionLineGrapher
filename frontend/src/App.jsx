import React, { useState } from "react";
import DataTable from "./components/DataTable";
import ResultChart from "./components/ResultChart";
import { getRegression } from "./services/api";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState([{ x: "", y: "", error: "" }]);
  const [power, setPower] = useState(1);
  const [params, setParams] = useState(null);
  const [equation, setEquation] = useState("");
  const [dataPoints, setDataPoints] = useState([]);
  const [fitCurve, setFitCurve] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Graph customization states
  const [graphTitle, setGraphTitle] = useState("Polynomial Regression Analysis");
  const [xAxisLabel, setXAxisLabel] = useState("X Values");
  const [yAxisLabel, setYAxisLabel] = useState("Y Values");
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleCellChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  const addRow = () => setRows([...rows, { x: "", y: "", error: "" }]);
  const removeRow = idx => rows.length > 1 && setRows(rows.filter((_, i) => i !== idx));

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    const xNums = [], yNums = [], dyNums = [];
    for (let { x, y, error } of rows) {
      if (x === "" || y === "") {
        alert("All rows must have X and Y values.");
        setIsLoading(false);
        return;
      }
      xNums.push(Number(x));
      yNums.push(Number(y));
      dyNums.push(error === "" ? 0 : Number(error));
    }

    try {
      // Call API with power
      const { params, fit_x, fit_y, equation } = await getRegression({ x: xNums, y: yNums, power });
      setParams(params);
      setEquation(equation || "");

      // Scatter points
      const pts = xNums.map((xi, i) => ({ x: xi, y: yNums[i], error: dyNums[i] }));
      setDataPoints(pts);

      // Fit curve points
      const curve = fit_x.map((xi, i) => ({ x: xi, y: fit_y[i] }));
      setFitCurve(curve);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const loadSampleData = () => {
    const sampleData = [
      { x: "1", y: "2.1", error: "0.1" },
      { x: "2", y: "3.9", error: "0.2" },
      { x: "3", y: "9.2", error: "0.3" },
      { x: "4", y: "15.8", error: "0.4" },
      { x: "5", y: "25.1", error: "0.5" }
    ];
    setRows(sampleData);
    setPower(2);
  };

  const clearData = () => {
    setRows([{ x: "", y: "", error: "" }]);
    setParams(null);
    setEquation("");
    setDataPoints([]);
    setFitCurve([]);
  };

  const exportData = () => {
    try {
      // Prepare data for export
      const validRows = rows.filter(row => row.x !== "" && row.y !== "");
      
      if (validRows.length === 0) {
        alert("No data to export. Please enter some data points first.");
        return;
      }

      // Create export content
      const timestamp = new Date().toISOString().split('T')[0];
      const content = [
        "# Regression Analysis Export",
        `# Generated on: ${new Date().toLocaleString()}`,
        `# Power/Degree: ${power}`,
        equation ? `# Equation: ${equation}` : "",
        "",
        "# Data Points",
        "X,Y,Error",
        ...validRows.map(row => `${row.x},${row.y},${row.error || 0}`),
        "",
        "# Regression Parameters",
        params ? `# Coefficients: [${params.map(p => p.toFixed(6)).join(', ')}]` : "# No regression computed",
        "",
        "# Fitted Curve Points (first 10)",
        fitCurve.length > 0 ? "X_fit,Y_fit" : "",
        ...fitCurve.slice(0, 10).map(point => `${point.x.toFixed(6)},${point.y.toFixed(6)}`)
      ].filter(line => line !== "").join('\n');

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `regression_analysis_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      alert(`Data exported successfully as regression_analysis_${timestamp}.csv`);
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const exportJSON = () => {
    try {
      const validRows = rows.filter(row => row.x !== "" && row.y !== "");
      
      if (validRows.length === 0) {
        alert("No data to export. Please enter some data points first.");
        return;
      }

      const exportData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          tool: "Regression Line Grapher",
          power: power,
          equation: equation || null
        },
        data: {
          points: validRows.map(row => ({
            x: parseFloat(row.x),
            y: parseFloat(row.y),
            error: row.error ? parseFloat(row.error) : 0
          })),
          regression: {
            coefficients: params || null,
            fitted_curve: fitCurve.length > 20 ? fitCurve.slice(0, 20) : fitCurve
          }
        }
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `regression_data_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`JSON data exported successfully as regression_data_${timestamp}.json`);
    } catch (error) {
      alert(`JSON export failed: ${error.message}`);
    }
  };

  const exportChart = () => {
    try {
      if (!params || dataPoints.length === 0) {
        alert("No chart to export. Please generate a graph first.");
        return;
      }

      // Find the chart container
      const chartContainer = document.querySelector('.recharts-wrapper');
      if (!chartContainer) {
        alert("Chart not found. Please ensure the graph is visible.");
        return;
      }

      // Create a canvas to render the chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (high resolution for better quality)
      canvas.width = 1200;
      canvas.height = 800;
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add title
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(graphTitle, canvas.width / 2, 40);
      
      // Add equation if available
      if (equation) {
        ctx.font = '18px monospace';
        ctx.fillStyle = '#27ae60';
        ctx.fillText(equation, canvas.width / 2, 70);
      }
      
      // Draw axes
      const margin = { top: 100, right: 100, bottom: 100, left: 100 };
      const chartWidth = canvas.width - margin.left - margin.right;
      const chartHeight = canvas.height - margin.top - margin.bottom;
      
      // Calculate data ranges
      const allX = [...dataPoints.map(p => p.x), ...fitCurve.map(p => p.x)];
      const allY = [...dataPoints.map(p => p.y), ...fitCurve.map(p => p.y)];
      const xMin = Math.min(...allX);
      const xMax = Math.max(...allX);
      const yMin = Math.min(...allY);
      const yMax = Math.max(...allY);
      
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      
      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = '#e8eff4';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
          const x = margin.left + (i * chartWidth / 10);
          ctx.beginPath();
          ctx.moveTo(x, margin.top);
          ctx.lineTo(x, margin.top + chartHeight);
          ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 8; i++) {
          const y = margin.top + (i * chartHeight / 8);
          ctx.beginPath();
          ctx.moveTo(margin.left, y);
          ctx.lineTo(margin.left + chartWidth, y);
          ctx.stroke();
        }
      }
      
      // Draw axes
      ctx.strokeStyle = '#b8c5d1';
      ctx.lineWidth = 2;
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top + chartHeight);
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, margin.top + chartHeight);
      ctx.stroke();
      
      // Add axis labels
      ctx.fillStyle = '#5a6c7d';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      
      // X-axis label
      ctx.fillText(xAxisLabel, margin.left + chartWidth / 2, canvas.height - 30);
      
      // Y-axis label
      ctx.save();
      ctx.translate(30, margin.top + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
      
      // Helper function to convert data coordinates to canvas coordinates
      const toCanvasX = (dataX) => margin.left + ((dataX - xMin) / xRange) * chartWidth;
      const toCanvasY = (dataY) => margin.top + chartHeight - ((dataY - yMin) / yRange) * chartHeight;
      
      // Draw fitted curve
      if (fitCurve.length > 1) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        fitCurve.forEach((point, i) => {
          const x = toCanvasX(point.x);
          const y = toCanvasY(point.y);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
      
      // Draw data points
      ctx.fillStyle = '#3498db';
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 2;
      
      dataPoints.forEach(point => {
        const x = toCanvasX(point.x);
        const y = toCanvasY(point.y);
        
        // Draw point
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw error bars if present
        if (point.error && point.error > 0) {
          const errorPixels = (point.error / yRange) * chartHeight;
          ctx.strokeStyle = '#2980b9';
          ctx.lineWidth = 2;
          
          // Vertical error bar
          ctx.beginPath();
          ctx.moveTo(x, y - errorPixels);
          ctx.lineTo(x, y + errorPixels);
          ctx.stroke();
          
          // Error bar caps
          ctx.beginPath();
          ctx.moveTo(x - 4, y - errorPixels);
          ctx.lineTo(x + 4, y - errorPixels);
          ctx.moveTo(x - 4, y + errorPixels);
          ctx.lineTo(x + 4, y + errorPixels);
          ctx.stroke();
        }
      });
      
      // Add legend if enabled
      if (showLegend && fitCurve.length > 0) {
        const legendX = margin.left + chartWidth - 200;
        const legendY = margin.top + 20;
        
        // Legend background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(legendX - 10, legendY - 10, 190, 60);
        ctx.strokeStyle = '#d1d9e6';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 10, 190, 60);
        
        // Data points legend
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(legendX + 10, legendY + 10, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('📊 Data Points', legendX + 25, legendY + 15);
        
        // Regression line legend
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legendX + 5, legendY + 35);
        ctx.lineTo(legendX + 20, legendY + 35);
        ctx.stroke();
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillText('📈 Regression Curve', legendX + 25, legendY + 40);
      }
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${graphTitle.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Chart exported successfully as ${link.download}`);
      }, 'image/png');
      
    } catch (error) {
      console.error('Chart export error:', error);
      alert(`Chart export failed: ${error.message}`);
    }
  };

  const importData = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            
            if (file.name.endsWith('.json')) {
              // Import JSON file
              const data = JSON.parse(content);
              if (data.data && data.data.points) {
                const importedRows = data.data.points.map(point => ({
                  x: point.x.toString(),
                  y: point.y.toString(),
                  error: point.error ? point.error.toString() : ""
                }));
                setRows(importedRows);
                if (data.metadata && data.metadata.power) {
                  setPower(data.metadata.power);
                }
                alert(`Successfully imported ${importedRows.length} data points from JSON file.`);
              } else {
                alert("Invalid JSON format. Expected data.points array.");
              }
            } else if (file.name.endsWith('.csv')) {
              // Import CSV file
              const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
              const dataLines = lines.slice(1); // Skip header
              const importedRows = dataLines.map(line => {
                const [x, y, error] = line.split(',');
                return {
                  x: x ? x.trim() : "",
                  y: y ? y.trim() : "",
                  error: error ? error.trim() : ""
                };
              }).filter(row => row.x && row.y);
              
              if (importedRows.length > 0) {
                setRows(importedRows);
                alert(`Successfully imported ${importedRows.length} data points from CSV file.`);
              } else {
                alert("No valid data found in CSV file.");
              }
            }
          } catch (error) {
            alert(`Import failed: ${error.message}`);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  // Graph control functions
  const openGraphSettings = () => {
    setShowSettingsModal(true);
  };

  const closeGraphSettings = () => {
    setShowSettingsModal(false);
  };

  const toggleGraphGrid = () => {
    setShowGrid(!showGrid);
  };

  const resetGraphView = () => {
    setGraphTitle("Polynomial Regression Analysis");
    setXAxisLabel("X Values");
    setYAxisLabel("Y Values");
    setShowGrid(true);
    setShowLegend(true);
    setShowSettingsModal(false);
  };

  return (
    <div className="logger-pro-app">
      {/* Top Menu Bar */}
      <div className="menu-bar">
        <div className="menu-left">
          <span className="app-title">📊 Regression Line Grapher</span>
          <span className="app-subtitle">IB Physics IA Tool</span>
        </div>
        <div className="menu-right">
          <button className="menu-btn" onClick={loadSampleData}>📋 Sample Data</button>
          <button className="menu-btn" onClick={importData}>📁 Import</button>
          <button className="menu-btn" onClick={clearData}>🗑️ Clear</button>
          <div className="menu-dropdown">
            <button className="menu-btn">💾 Export ▼</button>
            <div className="dropdown-content">
              <button onClick={exportData}>📊 Export CSV</button>
              <button onClick={exportJSON}>📄 Export JSON</button>
              <button onClick={exportChart}>📈 Export Chart</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Sidebar - Data Table */}
        <div className="sidebar">
          <div className="panel">
            <div className="panel-header">
              <h3>📋 Data Collection</h3>
            </div>
            <div className="panel-content">
              <DataTable
                rows={rows}
                handleCellChange={handleCellChange}
                addRow={addRow}
                removeRow={removeRow}
                power={power}
                onPowerChange={setPower}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Main Graph Area */}
        <div className="graph-area">
          <div className="panel">
            <div className="panel-header">
              <h3>📈 Graph</h3>
              <div className="graph-controls">
                <button 
                  className="control-btn" 
                  onClick={openGraphSettings}
                  title="Graph Settings"
                >
                  ⚙️
                </button>
                <button 
                  className="control-btn" 
                  onClick={toggleGraphGrid}
                  title="Toggle Grid"
                >
                  🔍
                </button>
                <button 
                  className="control-btn" 
                  onClick={resetGraphView}
                  title="Reset View"
                >
                  �
                </button>
              </div>
            </div>
            <div className="panel-content graph-content">
              <ResultChart
                params={params}
                dataPoints={dataPoints}
                fitCurve={fitCurve}
                power={power}
                equation={equation}
                graphTitle={graphTitle}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                showGrid={showGrid}
                showLegend={showLegend}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graph Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={closeGraphSettings}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Graph Settings</h3>
              <button className="modal-close" onClick={closeGraphSettings}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Graph Title</label>
                <input
                  type="text"
                  value={graphTitle}
                  onChange={(e) => setGraphTitle(e.target.value)}
                  placeholder="Enter graph title"
                />
              </div>
              
              <div className="form-group">
                <label>X-Axis Label</label>
                <input
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="Enter X-axis label"
                />
              </div>
              
              <div className="form-group">
                <label>Y-Axis Label</label>
                <input
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="Enter Y-axis label"
                />
              </div>
              
              <div className="form-group">
                <label>Display Options</label>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="showGrid"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                  <label htmlFor="showGrid">Show Grid Lines</label>
                </div>
                
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="showLegend"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                  />
                  <label htmlFor="showLegend">Show Legend</label>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={resetGraphView}>
                  🔄 Reset to Defaults
                </button>
                <button className="btn btn-primary" onClick={closeGraphSettings}>
                  ✅ Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-item">
            📊 Points: {dataPoints.length}
          </span>
          <span className="status-item">
            🔢 Power: {power}
          </span>
        </div>
        <div className="status-center">
          {equation && (
            <span className="equation-display">
              📐 Equation: <strong>{equation}</strong>
            </span>
          )}
        </div>
        <div className="status-right">
          {isLoading && <span className="loading">🔄 Computing...</span>}
          {params && !isLoading && <span className="status-ready">✅ Ready</span>}
        </div>
      </div>
    </div>
  );
}
