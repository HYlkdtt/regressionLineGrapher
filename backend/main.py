# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import numpy as np

from regression import PowerRegression

app = FastAPI(
    title="IB Physics IA Regression API",
    description="Compute power-based regression line (v0.3.0)",
    version="0.3.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}

@app.post("/regression")
async def compute_regression(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expects JSON body:
    {
      "x": [ ... ],        # list of numbers
      "y": [ ... ],        # list of numbers (same length as x)
      "power": <int>       # exponent for power regression (e.g. 1, 2, 3, -1, -2, ...)
    }

    Returns JSON:
    {
      "params": [a, b],     # a, b for model y = a * x^power + b
      "fit_x": [...],       # 200 points between min(x) and max(x)
      "fit_y": [...]        # predicted y values from the model
    }
    """
    # 1. Validate x and y
    if "x" not in payload or "y" not in payload:
        raise HTTPException(status_code=422, detail="Payload must include 'x' and 'y' arrays.")
    x = payload["x"]
    y = payload["y"]
    if not isinstance(x, list) or not isinstance(y, list):
        raise HTTPException(status_code=422, detail="'x' and 'y' must be lists of numbers.")
    if len(x) != len(y) or len(x) == 0:
        raise HTTPException(status_code=422, detail="'x' and 'y' must be non-empty lists of the same length.")

    # 2. Validate power
    power = payload.get("power", 1)
    if not isinstance(power, int):
        raise HTTPException(status_code=422, detail="'power' must be an integer.")

    # 3. Instantiate and fit the power regression model
    reg = PowerRegression(exponent=power)
    try:
        reg.fit(x, y)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during fitting: {e}")

    # 4. Extract model parameters a, b
    params = list(reg.get_params())  # [a, b]

    # 5. Generate sampling for the fitted curve
    arr_x = np.array(x, dtype=float)
    min_x, max_x = float(arr_x.min()), float(arr_x.max())
    sample_x = np.linspace(min_x, max_x, num=200)
    sample_y = reg.predict(sample_x)

    return {
        "params": params,
        "fit_x": sample_x.tolist(),
        "fit_y": sample_y.tolist()
    }
