# Polynomial Regression API Documentation

## Overview
The backend now supports **general polynomial regression** for arbitrary positive and negative degrees, replacing the previous power-only regression.

## API Endpoint: `/regression`

### Request Format
```json
{
  "x": [1, 2, 3, 4, 5],           // Array of x values
  "y": [1, 4, 9, 16, 25],         // Array of y values (same length as x)
  "power": 2                      // Degree of polynomial (integer between -10 and 10)
}
```

### Response Format
```json
{
  "params": [1.0, 0.0, 0.0],       // Polynomial coefficients [a_n, a_{n-1}, ..., a_1, a_0]
  "fit_x": [...],                  // 200 sample x points for plotting
  "fit_y": [...],                  // Corresponding y values from fitted model
  "equation": "1*x^2"              // Human-readable equation string
}
```

## Supported Regression Types

### Positive Powers (Standard Polynomial)
- **Power = 1**: Linear regression `y = ax + b`
- **Power = 2**: Quadratic regression `y = ax² + bx + c`
- **Power = 3**: Cubic regression `y = ax³ + bx² + cx + d`
- **Power = n**: n-degree polynomial `y = aₙx^n + ... + a₁x + a₀`

### Negative Powers (Inverse Functions)
- **Power = -1**: Inverse regression `y = a/x + b`
- **Power = -2**: Inverse squared `y = a/x² + b`
- **Power = -n**: Inverse n-power `y = a/x^n + b`

## Examples

### 1. Quadratic Regression (Power = 2)
```json
// Request
{
  "x": [1, 2, 3, 4, 5],
  "y": [1, 4, 9, 16, 25],
  "power": 2
}

// Response
{
  "params": [1.0, 0.0, 0.0],
  "equation": "1*x^2",
  "fit_x": [...],
  "fit_y": [...]
}
```

### 2. Inverse Regression (Power = -1)
```json
// Request
{
  "x": [1, 2, 4, 5, 10],
  "y": [10, 5, 2.5, 2, 1],
  "power": -1
}

// Response
{
  "params": [10.0, 0.0],
  "equation": "10/x",
  "fit_x": [...],
  "fit_y": [...]
}
```

### 3. Mixed Polynomial (Power = 2)
```json
// Request
{
  "x": [1, 2, 3, 4, 5],
  "y": [2, 7, 16, 29, 46],
  "power": 2
}

// Response
{
  "params": [2.0, -1.0, 1.0],
  "equation": "2*x^2 - 1*x + 1",
  "fit_x": [...],
  "fit_y": [...]
}
```

## Key Features

1. **Arbitrary Degree**: Supports polynomial regression from degree -10 to +10
2. **Automatic Coefficient Detection**: Returns all significant coefficients
3. **Human-Readable Equations**: Generates clean equation strings
4. **Safe Handling**: Prevents division by zero for negative powers
5. **Numerical Stability**: Limits degree range to prevent ill-conditioning

## Error Handling

- **422 Error**: Invalid input data, mismatched array lengths, or zero values with negative powers
- **500 Error**: Numerical computation errors (e.g., ill-conditioned matrices)

## Technical Implementation

- **Positive Powers**: Uses `numpy.polyfit()` for standard polynomial fitting
- **Negative Powers**: Transforms data using `1/x^|power|` then fits linear regression
- **Zero Handling**: Automatically avoids sampling at x=0 for negative powers
- **Equation Generation**: Smart formatting with proper signs and coefficient display
