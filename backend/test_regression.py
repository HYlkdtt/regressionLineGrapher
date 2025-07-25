#!/usr/bin/env python3
"""
Test script for the polynomial regression API
"""

import json
import requests
import numpy as np

def test_polynomial_regression():
    base_url = "http://localhost:8000"
    
    print("Testing Polynomial Regression API")
    print("=" * 50)
    
    # Test 1: Linear regression (power = 1)
    print("\n1. Testing Linear Regression (power = 1)")
    test_data = {
        "x": [1, 2, 3, 4, 5],
        "y": [2, 4, 6, 8, 10],  # y = 2x
        "power": 1
    }
    
    try:
        response = requests.post(f"{base_url}/regression", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   Equation: {result['equation']}")
            print(f"   Coefficients: {result['params']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Connection error: {e}")
    
    # Test 2: Quadratic regression (power = 2)
    print("\n2. Testing Quadratic Regression (power = 2)")
    test_data = {
        "x": [1, 2, 3, 4, 5],
        "y": [1, 4, 9, 16, 25],  # y = x^2
        "power": 2
    }
    
    try:
        response = requests.post(f"{base_url}/regression", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   Equation: {result['equation']}")
            print(f"   Coefficients: {result['params']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Connection error: {e}")
    
    # Test 3: Cubic regression (power = 3)
    print("\n3. Testing Cubic Regression (power = 3)")
    test_data = {
        "x": [1, 2, 3, 4],
        "y": [1, 8, 27, 64],  # y = x^3
        "power": 3
    }
    
    try:
        response = requests.post(f"{base_url}/regression", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   Equation: {result['equation']}")
            print(f"   Coefficients: {result['params']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Connection error: {e}")
    
    # Test 4: Inverse regression (power = -1)
    print("\n4. Testing Inverse Regression (power = -1)")
    test_data = {
        "x": [1, 2, 4, 5, 10],
        "y": [10, 5, 2.5, 2, 1],  # y = 10/x
        "power": -1
    }
    
    try:
        response = requests.post(f"{base_url}/regression", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   Equation: {result['equation']}")
            print(f"   Coefficients: {result['params']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Connection error: {e}")
    
    # Test 5: Inverse squared regression (power = -2)
    print("\n5. Testing Inverse Squared Regression (power = -2)")
    test_data = {
        "x": [1, 2, 3, 4, 5],
        "y": [100, 25, 11.11, 6.25, 4],  # y = 100/x^2
        "power": -2
    }
    
    try:
        response = requests.post(f"{base_url}/regression", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   Equation: {result['equation']}")
            print(f"   Coefficients: {result['params']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Connection error: {e}")

if __name__ == "__main__":
    test_polynomial_regression()
