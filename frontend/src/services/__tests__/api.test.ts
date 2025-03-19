import { calculationService } from '../api';

describe('CalculationService', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({
        status: 'success',
        data: {
          method: 'test',
          value: 1,
          error: 0,
          iterations: 1,
          points: []
        }
      }));
    });
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  describe('calculate', () => {
    it('should format trapezoidal integration request correctly', async () => {
      const request = {
        method: 'trapezoidal',
        expression: 'x^2',
        parameters: {
          lowerBound: 0,
          upperBound: 1,
          numPoints: 100
        }
      };

      await calculationService.calculate(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/calculate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            methodId: 'trapezoidal',
            parameters: {
              function: 'x^2',
              lowerBound: 0,
              upperBound: 1,
              numPoints: 100
            }
          })
        })
      );
    });

    it('should format newton root finding request correctly', async () => {
      const request = {
        method: 'newton',
        expression: 'x^2 - 4',
        parameters: {
          initialGuess: 2,
          tolerance: 1e-6
        }
      };

      await calculationService.calculate(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/calculate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            methodId: 'newton',
            parameters: {
              function: 'x^2 - 4',
              initialGuess: 2,
              tolerance: 1e-6
            }
          })
        })
      );
    });

    it('should format differentiation request correctly', async () => {
      const request = {
        method: 'central',
        expression: 'x^2',
        parameters: {
          point: 1,
          stepSize: 1e-6
        }
      };

      await calculationService.calculate(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/calculate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            methodId: 'central',
            parameters: {
              function: 'x^2',
              point: 1,
              stepSize: 1e-6
            }
          })
        })
      );
    });

    it('should include function in parameters for all methods', async () => {
      const request = {
        method: 'trapezoidal',
        expression: 'x^2',
        parameters: {
          lowerBound: 0,
          upperBound: 1,
          numPoints: 100
        }
      };

      await calculationService.calculate(request);

      const fetchCall = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);
      
      expect(body.parameters.function).toBeDefined();
      expect(body.methodId).toBeDefined();
    });

    it('should send request with exact required structure', async () => {
      const request = {
        method: 'trapezoidal',
        expression: 'x^2',
        parameters: {
          lowerBound: 0,
          upperBound: 1,
          numPoints: 100
        }
      };

      await calculationService.calculate(request);

      const fetchCall = mockFetch.mock.calls[0][1];
      const requestBody = JSON.parse(fetchCall.body);
      
      // Log the exact request structure
      console.log('Request body structure:', JSON.stringify(requestBody, null, 2));
      
      // Verify the exact structure matches the backend requirements
      expect(requestBody).toEqual({
        methodId: 'trapezoidal',
        parameters: {
          function: 'x^2',
          lowerBound: 0,
          upperBound: 1,
          numPoints: 100
        }
      });

      // Verify no extra properties
      expect(Object.keys(requestBody)).toEqual(['methodId', 'parameters']);
      expect(Object.keys(requestBody.parameters)).toEqual(['function', 'lowerBound', 'upperBound', 'numPoints']);
    });
  });
}); 