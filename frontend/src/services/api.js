const API_BASE = "http://localhost:8000";

/**
 * Call the back-end power regression endpoint
 * @param {{ x: number[], y: number[], power: number }} params
 * @returns {Promise<{ params: number[], fit_x: number[], fit_y: number[] }>} 
 */
export async function getRegression({ x, y, power }) {
  const response = await fetch(`${API_BASE}/regression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y, power }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Regression API error: ${response.status} – ${text}`);
  }
  return response.json();
}