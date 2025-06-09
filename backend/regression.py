# backend/regression.py
import numpy as np
from typing import Tuple
from numpy.typing import ArrayLike

class PowerRegression:
    """
    Regression of form y = a * x^exponent + b for integer exponent (positive or negative).
    """
    def __init__(self, exponent: int):
        if not isinstance(exponent, int):
            raise ValueError("Exponent must be an integer.")
        self.exponent = exponent
        self.a: float = 0.0
        self.b: float = 0.0

    def fit(self, x: ArrayLike, y: ArrayLike) -> None:
        """
        Fit the model y = a * x^exponent + b to data.
        """
        arrX = np.array(x, dtype=float) ** self.exponent
        arrY = np.array(y, dtype=float)
        # Solve for a and b via linear fit on transformed x
        self.a, self.b = np.polyfit(arrX, arrY, 1)

    def predict(self, x: ArrayLike) -> np.ndarray:
        """
        Predict y values for new x data.
        """
        arrX = np.array(x, dtype=float) ** self.exponent
        return self.a * arrX + self.b

    def get_params(self) -> Tuple[float, float]:
        """
        Return tuple (a, b) of model parameters.
        """
        return float(self.a), float(self.b)
