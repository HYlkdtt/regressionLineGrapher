from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

from regression import compute_linear_fit

app = FastAPI(
    title="IB Physics IA Regression API",
    description="Compute unweighted regression line (v0.1.0)",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/regression")
async def compute_regression(payload: Dict):
    """
    Expect JSON body:
    {
      "x": [ ... ],   # list of numbers
      "y": [ ... ]    # list of numbers, same length as x
    }
    Returns JSON:
    {
      "slope": <float>,
      "intercept": <float>
    }
    """
    #Validate presence of x & y
    if "x" not in payload or "y" not in payload:
        raise HTTPException(
            status_code=422,
            detail="Payload must include 'x' and 'y' arrays."
        )

    x = payload["x"]
    y = payload["y"]

    #Ensure they are lists of equal length
    if not (isinstance(x, list) and isinstance(y, list)):
        raise HTTPException(
            status_code=422,
            detail="'x' and 'y' must be lists of numbers."
        )
    if len(x) != len(y):
        raise HTTPException(
            status_code=422,
            detail="'x' and 'y' must have the same length."
        )

    #Run the unweighted fit
    try:
        slope, intercept = compute_linear_fit(x, y)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during linear fit: {e}"
        )

    return {"slope": slope, "intercept": intercept}