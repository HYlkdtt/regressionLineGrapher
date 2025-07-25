# Regression Line Grapher
This is a dedicated software for IB Physics Internal Assessments

## Features
- **General Polynomial Regression**: Supports arbitrary positive and negative degree polynomials
- **Multiple Regression Types**: Linear, quadratic, cubic, inverse, inverse-squared, and more
- **Interactive Frontend**: Built with React/Vite for responsive data input and visualization
- **RESTful API**: FastAPI backend with comprehensive error handling
- **Real-time Plotting**: Dynamic chart generation with fitted curves

## Supported Regression Models
- **Positive Powers**: y = aₙx^n + ... + a₁x + a₀ (standard polynomials)
- **Negative Powers**: y = a/x^n + b (inverse functions)
- **Degree Range**: -10 to +10 for numerical stability

## Quick Start
1. **Backend**: `cd backend && python -m uvicorn main:app --reload`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **Access**: Open http://localhost:5173 in your browser

## API Usage
Send POST requests to `/regression` with:
```json
{
  "x": [1, 2, 3, 4, 5],
  "y": [1, 4, 9, 16, 25],
  "power": 2
}
```

See `backend/POLYNOMIAL_REGRESSION_API.md` for detailed documentation.
