# backend/regression.py
import numpy as np

def compute_linear_fit(x: list[float], y: list[float]) -> tuple[float, float]:
    arrX = np.array(x, dtype = float)
    arrY = np.array(y, dtype = float)
    slope, intercept = np.polyfit(arrX, arrY, 1)

    return float(slope), float(intercept)