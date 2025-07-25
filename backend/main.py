# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import numpy as np

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
      "power": <int>       # degree for polynomial regression (e.g. 1, 2, 3, -1, -2, ...)
    }

    Returns JSON:
    {
      "params": [...],      # coefficients [a_n, a_{n-1}, ..., a_1, a_0] for polynomial
      "fit_x": [...],       # 200 points between min(x) and max(x)
      "fit_y": [...],       # predicted y values from the model
      "equation": "..."     # string representation of the fitted equation
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

    # 2. Validate power (degree)
    power = payload.get("power", 1)
    if not isinstance(power, int):
        raise HTTPException(status_code=422, detail="'power' must be an integer.")
    
    if abs(power) > 10:
        raise HTTPException(status_code=422, detail="'power' must be between -10 and 10 for numerical stability.")

    # Convert to numpy arrays
    arr_x = np.array(x, dtype=float)
    arr_y = np.array(y, dtype=float)

    try:
        if power >= 0:
            # Standard polynomial regression: y = a_n*x^n + ... + a_1*x + a_0
            coeffs = np.polyfit(arr_x, arr_y, power)
            
            # Generate equation string
            terms = []
            for i, coeff in enumerate(coeffs):
                deg = power - i
                if abs(coeff) < 1e-10:  # Skip near-zero coefficients
                    continue
                if deg == 0:
                    terms.append(f"{coeff:.6g}")
                elif deg == 1:
                    terms.append(f"{coeff:.6g}*x")
                else:
                    terms.append(f"{coeff:.6g}*x^{deg}")
            
            equation = " + ".join(terms).replace("+ -", "- ")
            
            # Generate fitted curve
            min_x, max_x = float(arr_x.min()), float(arr_x.max())
            sample_x = np.linspace(min_x, max_x, num=200)
            sample_y = np.polyval(coeffs, sample_x)
            
        else:
            # Negative power: transform to 1/x^|power| then fit polynomial
            abs_power = abs(power)
            
            # Check for zeros in x data
            if np.any(arr_x == 0):
                raise HTTPException(
                    status_code=422,
                    detail="Cannot use negative power when x contains zero."
                )
            
            # Transform x -> 1/x^|power|
            transformed_x = 1.0 / (arr_x ** abs_power)
            
            # Fit linear regression: y = a*(1/x^|power|) + b
            coeffs = np.polyfit(transformed_x, arr_y, 1)  # [a, b]
            
            # Generate equation string
            if abs_power == 1:
                equation = f"{coeffs[0]:.6g}/x + {coeffs[1]:.6g}".replace("+ -", "- ")
            else:
                equation = f"{coeffs[0]:.6g}/x^{abs_power} + {coeffs[1]:.6g}".replace("+ -", "- ")
            
            # Generate fitted curve
            min_x, max_x = float(arr_x.min()), float(arr_x.max())
            
            # Avoid sampling at zero for negative powers
            if min_x < 0 < max_x:
                # Split around zero
                eps = 1e-6
                neg_side = np.linspace(min_x, -eps, num=100, endpoint=False)
                pos_side = np.linspace(eps, max_x, num=100, endpoint=True)
                sample_x = np.concatenate([neg_side, pos_side])
            else:
                # Adjust endpoints if they are exactly zero
                if min_x == 0:
                    min_x = 1e-6
                if max_x == 0:
                    max_x = -1e-6
                sample_x = np.linspace(min_x, max_x, num=200)
            
            # Predict using the inverse relationship
            transformed_sample_x = 1.0 / (sample_x ** abs_power)
            sample_y = coeffs[0] * transformed_sample_x + coeffs[1]

    except np.linalg.LinAlgError:
        raise HTTPException(status_code=422, detail="Unable to fit polynomial - data may be ill-conditioned.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during fitting: {e}")

    return {
        "params": coeffs.tolist(),
        "fit_x": sample_x.tolist(),
        "fit_y": sample_y.tolist(),
        "equation": equation
    }
