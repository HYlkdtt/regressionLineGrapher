// frontend/src/services/api.js

const API_BASE = "http://localhost:8000"; // FastAPI URL

/**
 * Send x,y arrays to the regression endpoint and return { slope, intercept }.
 * @param {{ x: number[], y: number[] }} params
 * @returns {Promise<{ slope: number, intercept: number }>}
 */
export async function getRegression({ x, y }) {
  const response = await fetch(`${API_BASE}/regression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Regression API error: ${response.status} – ${text}`);
  }
  return response.json(); // expects { slope, intercept }
}
