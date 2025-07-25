import React from "react";
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
  Line,
  ErrorBar,
  ResponsiveContainer
} from "recharts";

export default function ResultChart({ 
  params, 
  dataPoints, 
  fitCurve, 
  power, 
  equation,
  graphTitle = "Polynomial Regression Analysis",
  xAxisLabel = "X Values",
  yAxisLabel = "Y Values",
  showGrid = true,
  showLegend = true
}) {
  if (!params || dataPoints.length === 0) {
    return (
      <div style={{ 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexDirection: "column",
        color: "#7f8c8d",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <div style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px" }}>
          No Data to Display
        </div>
        <div style={{ fontSize: "14px", textAlign: "center", lineHeight: "1.4" }}>
          Enter your data points in the table<br/>
          and click "Analyze & Plot" to see the graph
        </div>
      </div>
    );
  }

  // Custom tooltip for professional look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid #d1d9e6",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontSize: "12px"
        }}>
          <p style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#2c3e50" }}>
            X: {typeof label === 'number' ? label.toFixed(4) : label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: "0", 
              color: entry.color,
              fontWeight: "500"
            }}>
              {entry.name}: {entry.value.toFixed(4)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const legendPayload = [
    {
      value: "📊 Data Points",
      type: "rect",
      id: "data",
      color: "#3498db"
    },
    {
      value: `📈 Regression Curve (Power: ${power})`,
      type: "line",
      id: "fit",
      color: "#e74c3c"
    }
  ];

  return (
    <div style={{ height: "100%", background: "#ffffff" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={dataPoints}
          margin={{ top: 60, right: 30, bottom: 60, left: 60 }}
        >
          {/* Professional title */}
          <text
            x="50%"
            y={30}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              fill: '#2c3e50'
            }}
          >
            {graphTitle}
          </text>
          
          {/* Equation display */}
          {equation && (
            <text
              x="50%"
              y={50}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                fontSize: '13px', 
                fontWeight: '500',
                fill: '#27ae60',
                fontFamily: 'monospace'
              }}
            >
              {equation}
            </text>
          )}

          {/* Professional grid */}
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="#e8eff4" 
              strokeWidth={1}
            />
          )}
          
          {/* X-Axis with professional styling */}
          <XAxis
            type="number"
            dataKey="x"
            domain={['auto', 'auto']}
            label={{ 
              value: xAxisLabel, 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fontSize: '12px', fill: '#5a6c7d' }
            }}
            tick={{ fontSize: 11, fill: '#5a6c7d' }}
            axisLine={{ stroke: '#b8c5d1', strokeWidth: 1 }}
            tickLine={{ stroke: '#b8c5d1', strokeWidth: 1 }}
          />
          
          {/* Y-Axis with professional styling */}
          <YAxis
            type="number"
            dataKey="y"
            domain={['auto', 'auto']}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '12px', fill: '#5a6c7d' }
            }}
            tick={{ fontSize: 11, fill: '#5a6c7d' }}
            axisLine={{ stroke: '#b8c5d1', strokeWidth: 1 }}
            tickLine={{ stroke: '#b8c5d1', strokeWidth: 1 }}
          />
          
          {/* Custom tooltip */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* Professional legend */}
          {showLegend && (
            <Legend 
              payload={legendPayload}
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          )}

          {/* Data points with error bars */}
          <Scatter 
            name="Data Points" 
            data={dataPoints} 
            fill="#3498db"
            strokeWidth={2}
            stroke="#2980b9"
          >
            <ErrorBar 
              dataKey="error" 
              width={8} 
              strokeWidth={2} 
              stroke="#e74c3c"
              direction="y" 
            />
          </Scatter>

          {/* Regression line */}
          <Line
            name="Regression Curve"
            type="linear"
            dataKey="y"
            data={fitCurve}
            stroke="#e74c3c"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}