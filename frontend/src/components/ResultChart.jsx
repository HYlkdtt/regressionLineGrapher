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

export default function ResultChart({ params, dataPoints, fitCurve, power }) {
  if (!params) return null;
  const [a, b] = params;
  const legendPayload = [
    {
      value: `Fit: y = ${a.toFixed(2)}x^${power} + ${b.toFixed(2)}`,
      type: "line",
      id: "fit",
      color: "#ff7300"
    }
  ];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer>
        <ComposedChart
          data={dataPoints}
          margin={{ top: 40, right: 30, bottom: 40, left: 50 }}
        >
          <text
            x="50%"
            y={20}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '16px', fontWeight: 'bold' }}
          >
            My Graph
          </text>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            label={{ value: 'X-Axis / units', position: 'insideBottom', dy: 20 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            label={{ value: 'Y-Axis / units', angle: -90, position: 'insideLeft', dx: -20 }}
          />
          <Tooltip />
          <Legend payload={legendPayload} verticalAlign="top" align="left" wrapperStyle={{ top: 0, left: 60 }} />

          <Scatter name="Data Points" data={dataPoints} fill="#8884d8">
            <ErrorBar dataKey="error" width={6} strokeWidth={1} direction="y" />
          </Scatter>

          <Line
            name="Fit Curve"
            type="linear"
            dataKey="y"
            data={fitCurve}
            stroke="#ff7300"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}