import type { CalculationResult } from '../types';

export interface CalculationRequest {
  methodId: string;
  parameters: {
    function: string;
    // Root finding parameters
    initialGuess?: number;
    tolerance?: number;
    // Secant method parameters
    firstGuess?: number;
    secondGuess?: number;
    // Integration parameters
    lowerBound?: number;
    upperBound?: number;
    numPoints?: number;
    // Differentiation parameters
    point?: number;
    stepSize?: number;
  };
}

class CalculationService {
  private baseUrl: string;

  constructor() {
    // Keep the /api prefix to match backend routes
    this.baseUrl = 'http://localhost:3000/api';
  }

  async calculate(request: {
    method: string;
    expression: string;
    parameters: Record<string, number>;
  }): Promise<CalculationResult> {
    const { method, expression, parameters } = request;
    
    // Initialize the parameters object with the function
    const methodParameters: CalculationRequest['parameters'] = {
      function: expression
    };

    // Add method-specific parameters
    switch (method) {
      case 'newton':
        Object.assign(methodParameters, {
          initialGuess: parameters.initialGuess,
          tolerance: parameters.tolerance
        });
        break;
      case 'bisection':
        Object.assign(methodParameters, {
          lowerBound: parameters.lowerBound,
          upperBound: parameters.upperBound,
          tolerance: parameters.tolerance
        });
        break;
      case 'secant':
        Object.assign(methodParameters, {
          firstGuess: parameters.firstGuess,
          secondGuess: parameters.secondGuess,
          tolerance: parameters.tolerance
        });
        break;
      case 'trapezoidal':
      case 'simpson':
      case 'midpoint':
        Object.assign(methodParameters, {
          lowerBound: parameters.lowerBound,
          upperBound: parameters.upperBound,
          numPoints: parameters.numPoints
        });
        break;
      case 'forward':
      case 'central':
      case 'backward':
        Object.assign(methodParameters, {
          point: parameters.point,
          stepSize: parameters.stepSize
        });
        break;
    }

    // Construct the final request with explicit type
    const backendRequest: CalculationRequest = {
      methodId: method,
      parameters: methodParameters
    };

    console.log('Request body:', JSON.stringify(backendRequest, null, 2));

    try {
      const response = await fetch(`${this.baseUrl}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
      });

      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error('Invalid response format from server');
      }

      if (!data) {
        throw new Error('Empty response from server');
      }

      if (!response.ok || data.status === 'error') {
        throw new Error(data?.message || data?.error || 'Calculation failed');
      }

      if (!data.data || typeof data.data !== 'object') {
        throw new Error('Invalid calculation result format');
      }

      return {
        method: data.data.method,
        value: data.data.value,
        error: data.data.error,
        iterations: data.data.iterations,
        points: data.data.points
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to perform calculation');
    }
  }

  async validateExpression(expression: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression }),
      });

      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        return false;
      }

      if (!data || !response.ok || data.status === 'error') {
        return false;
      }

      return data.valid;
    } catch (error) {
      return false;
    }
  }
}

export const calculationService = new CalculationService(); 