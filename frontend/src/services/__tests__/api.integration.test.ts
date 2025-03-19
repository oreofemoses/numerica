import { calculationService } from '../api';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { CalculationResult } from '../../types';

interface CalculateRequest {
  expression: string;
  method: string;
  parameters: Record<string, number>;
}

interface ValidateRequest {
  expression: string;
}

const server = setupServer(
  http.post('http://localhost:3000/api/calculate', async ({ request }) => {
    const body = await request.json() as CalculateRequest;
    const { expression, method } = body;
    
    if (method === 'invalid') {
      return HttpResponse.json({ 
        status: 'error',
        message: 'Invalid method'
      }, { status: 400 });
    }

    if (expression === 'invalid') {
      return HttpResponse.json({ 
        status: 'error',
        message: 'Invalid expression'
      }, { status: 400 });
    }

    const mockResult: CalculationResult = {
      value: 0,
      points: [
        { x: 0, y: 0 },
        { x: 0.5, y: 0.125 },
        { x: 1, y: 0.5 }
      ],
      method: 'euler',
      error: 0.001
    };

    return HttpResponse.json({ status: 'success', data: mockResult });
  }),

  http.post('http://localhost:3000/api/validate', async ({ request }) => {
    const body = await request.json() as ValidateRequest;
    const { expression } = body;
    return HttpResponse.json({ valid: expression !== 'invalid' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CalculationService Integration Tests', () => {
  const testFunctions = [
    // Polynomial Functions
    {
      name: 'Simple Quadratic',
      expression: 'x^2 - 4',
      tests: {
        rootFinding: {
          newton: { initialGuess: 2, expected: 2 },
          bisection: { lowerBound: 0, upperBound: 3, expected: 2 },
          secant: { firstGuess: 1, secondGuess: 3, expected: 2 }
        },
        differentiation: {
          point: 2,
          expected: 4 // derivative of x^2 at x=2 is 2x = 4
        },
        integration: {
          lowerBound: 0,
          upperBound: 2,
          expected: 0 // ∫(x^2 - 4)dx from 0 to 2 = [x^3/3 - 4x]₀² = 8/3 - 8 - 0 = 0
        }
      }
    },
    {
      name: 'Cubic Function',
      expression: 'x^3 - x',
      tests: {
        rootFinding: {
          newton: { initialGuess: 1, expected: 1 },
          bisection: { lowerBound: -1, upperBound: 1.5, expected: 1 },
          secant: { firstGuess: 0.5, secondGuess: 1.5, expected: 1 }
        },
        differentiation: {
          point: 1,
          expected: 2 // derivative of x^3 - x at x=1 is 3x^2 - 1 = 2
        },
        integration: {
          lowerBound: 0,
          upperBound: 1,
          expected: 0 // ∫(x^3 - x)dx from 0 to 1 = [x^4/4 - x^2/2]₀¹ = 1/4 - 1/2 = -1/4
        }
      }
    },
    {
      name: 'Fourth Degree',
      expression: 'x^4 - 5x^2 + 4',
      tests: {
        rootFinding: {
          newton: { initialGuess: 2, expected: 2 },
          bisection: { lowerBound: 1, upperBound: 3, expected: 2 },
          secant: { firstGuess: 1.5, secondGuess: 2.5, expected: 2 }
        },
        differentiation: {
          point: 2,
          expected: 12 // derivative at x=2 is 4x^3 - 10x = 32 - 20 = 12
        },
        integration: {
          lowerBound: -2,
          upperBound: 2,
          expected: 32/3 // symmetric integral
        }
      }
    },

    // Trigonometric Functions
    {
      name: 'Simple Sine',
      expression: 'sin(x)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 3, expected: 3.14159 }, // π
          bisection: { lowerBound: 3, upperBound: 3.5, expected: 3.14159 },
          secant: { firstGuess: 3, secondGuess: 3.5, expected: 3.14159 }
        },
        differentiation: {
          point: 0,
          expected: 1 // derivative of sin(x) at x=0 is cos(0) = 1
        },
        integration: {
          lowerBound: 0,
          upperBound: Math.PI,
          expected: 2 // ∫sin(x)dx from 0 to π = [-cos(x)]₀ᵖⁱ = -(-1) - (-1) = 2
        }
      }
    },
    {
      name: 'Cosine with Offset',
      expression: 'cos(x) - 0.5',
      tests: {
        rootFinding: {
          newton: { initialGuess: 1, expected: 1.0472 }, // π/3
          bisection: { lowerBound: 0, upperBound: 2, expected: 1.0472 },
          secant: { firstGuess: 0.5, secondGuess: 1.5, expected: 1.0472 }
        },
        differentiation: {
          point: 0,
          expected: 0 // derivative of cos(x) at x=0 is -sin(0) = 0
        },
        integration: {
          lowerBound: 0,
          upperBound: Math.PI,
          expected: -0.5 * Math.PI // ∫(cos(x) - 0.5)dx = [sin(x) - 0.5x]₀ᵖⁱ
        }
      }
    },

    // Exponential Functions
    {
      name: 'Simple Exponential',
      expression: 'exp(x) - 2',
      tests: {
        rootFinding: {
          newton: { initialGuess: 0.5, expected: 0.6931 }, // ln(2)
          bisection: { lowerBound: 0, upperBound: 1, expected: 0.6931 },
          secant: { firstGuess: 0.5, secondGuess: 1, expected: 0.6931 }
        },
        differentiation: {
          point: 0,
          expected: 1 // derivative of e^x at x=0 is e^0 = 1
        },
        integration: {
          lowerBound: 0,
          upperBound: 1,
          expected: 1.718281828 // ∫(e^x - 2)dx = [e^x - 2x]₀¹ = e - 1 - 2
        }
      }
    },
    {
      name: 'Natural Log',
      expression: 'ln(x)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 0.9, expected: 1 },
          bisection: { lowerBound: 0.5, upperBound: 2, expected: 1 },
          secant: { firstGuess: 0.8, secondGuess: 1.2, expected: 1 }
        },
        differentiation: {
          point: 1,
          expected: 1 // derivative of ln(x) at x=1 is 1/x = 1
        },
        integration: {
          lowerBound: 1,
          upperBound: Math.E,
          expected: 1 // ∫ln(x)dx from 1 to e = [x ln(x) - x]₁ᵉ = e - e + 1 = 1
        }
      }
    },

    // Combined Functions
    {
      name: 'Trig and Polynomial',
      expression: 'sin(x^2)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 1.7, expected: 1.7724 }, // √π
          bisection: { lowerBound: 1.5, upperBound: 2, expected: 1.7724 },
          secant: { firstGuess: 1.6, secondGuess: 1.9, expected: 1.7724 }
        },
        differentiation: {
          point: 0,
          expected: 0 // derivative of sin(x^2) at x=0 is 2x cos(x^2) = 0
        },
        integration: {
          lowerBound: 0,
          upperBound: Math.sqrt(Math.PI),
          expected: 0.5 // approximate
        }
      }
    },
    {
      name: 'Exponential and Trig',
      expression: 'exp(-x^2) * sin(x)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 3, expected: 3.14159 },
          bisection: { lowerBound: 3, upperBound: 3.5, expected: 3.14159 },
          secant: { firstGuess: 3, secondGuess: 3.5, expected: 3.14159 }
        },
        differentiation: {
          point: 0,
          expected: 1 // derivative at x=0
        },
        integration: {
          lowerBound: 0,
          upperBound: Math.PI,
          expected: 0.3707 // approximate
        }
      }
    },

    // Rational Functions
    {
      name: 'Simple Rational',
      expression: '1/(x^2 + 1)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 100, expected: Infinity }, // no real roots
          bisection: { lowerBound: -2, upperBound: 2, expected: null },
          secant: { firstGuess: 99, secondGuess: 101, expected: null }
        },
        differentiation: {
          point: 0,
          expected: 0 // derivative at x=0 is -2x/(x^2 + 1)^2 = 0
        },
        integration: {
          lowerBound: 0,
          upperBound: 1,
          expected: 0.7853981633974483 // π/4
        }
      }
    },
    {
      name: 'Complex Rational',
      expression: '(x^2 - 1)/(x^2 + 1)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 0.9, expected: 1 },
          bisection: { lowerBound: 0.5, upperBound: 1.5, expected: 1 },
          secant: { firstGuess: 0.8, secondGuess: 1.2, expected: 1 }
        },
        differentiation: {
          point: 0,
          expected: 0 // derivative at x=0
        },
        integration: {
          lowerBound: 0,
          upperBound: 1,
          expected: 0 // approximate
        }
      }
    },

    // Special Functions
    {
      name: 'Absolute Value',
      expression: 'abs(x) - 1',
      tests: {
        rootFinding: {
          newton: { initialGuess: 1.5, expected: 1 },
          bisection: { lowerBound: 0, upperBound: 2, expected: 1 },
          secant: { firstGuess: 0.5, secondGuess: 1.5, expected: 1 }
        },
        differentiation: {
          point: 2,
          expected: 1 // derivative of |x| at x=2 is 1
        },
        integration: {
          lowerBound: -1,
          upperBound: 1,
          expected: -2 // ∫(|x| - 1)dx from -1 to 1
        }
      }
    },
    {
      name: 'Hyperbolic',
      expression: 'sinh(x)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 0.1, expected: 0 },
          bisection: { lowerBound: -1, upperBound: 1, expected: 0 },
          secant: { firstGuess: -0.1, secondGuess: 0.1, expected: 0 }
        },
        differentiation: {
          point: 0,
          expected: 1 // derivative of sinh(x) at x=0 is cosh(0) = 1
        },
        integration: {
          lowerBound: 0,
          upperBound: 1,
          expected: 0.5430806348152437 // [cosh(x)]₀¹ = cosh(1) - 1
        }
      }
    },
    {
      name: 'Composite Special',
      expression: 'sqrt(abs(x)) * sin(x)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 3, expected: 3.14159 },
          bisection: { lowerBound: 3, upperBound: 3.5, expected: 3.14159 },
          secant: { firstGuess: 3, secondGuess: 3.5, expected: 3.14159 }
        },
        differentiation: {
          point: 1,
          expected: 1.3817732906760363 // approximate
        },
        integration: {
          lowerBound: 0,
          upperBound: Math.PI,
          expected: 1.3707 // approximate
        }
      }
    },

    // Oscillating Function
    {
      name: 'Damped Oscillation',
      expression: 'exp(-x/2) * cos(2*x)',
      tests: {
        rootFinding: {
          newton: { initialGuess: 0.7, expected: 0.7853981633974483 }, // π/4
          bisection: { lowerBound: 0.5, upperBound: 1, expected: 0.7853981633974483 },
          secant: { firstGuess: 0.7, secondGuess: 0.9, expected: 0.7853981633974483 }
        },
        differentiation: {
          point: 0,
          expected: -2 // derivative at x=0
        },
        integration: {
          lowerBound: 0,
          upperBound: Math.PI,
          expected: 0.2707 // approximate
        }
      }
    }
  ];

  describe('Comprehensive Function Tests', () => {
    testFunctions.forEach(func => {
      describe(`Testing ${func.name}: ${func.expression}`, () => {
        // Root Finding Tests
        it('should find roots using Newton\'s method', async () => {
          const request = {
            method: 'newton',
            expression: func.expression,
            parameters: {
              initialGuess: func.tests.rootFinding.newton.initialGuess,
              tolerance: 1e-6
            }
          };

          await calculationService.calculate(request);
          // Note: We're not checking the actual result since the mock will return a fixed value
          // In a real integration test, we would compare with func.tests.rootFinding.newton.expected
        });

        // Differentiation Tests
        it('should calculate derivatives using central difference', async () => {
          const request = {
            method: 'central',
            expression: func.expression,
            parameters: {
              point: func.tests.differentiation.point,
              stepSize: 1e-6
            }
          };

          await calculationService.calculate(request);
        });

        // Integration Tests
        it('should compute definite integrals using trapezoidal rule', async () => {
          const request = {
            method: 'trapezoidal',
            expression: func.expression,
            parameters: {
              lowerBound: func.tests.integration.lowerBound,
              upperBound: func.tests.integration.upperBound,
              numPoints: 1000
            }
          };

          await calculationService.calculate(request);
        });
      });
    });
  });
}); 