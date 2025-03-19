import { http, HttpResponse } from 'msw';
import { CalculationResult } from '../types';

interface CalculateRequest {
  expression: string;
  method: string;
  parameters: Record<string, number>;
}

interface ValidateRequest {
  expression: string;
}

export const handlers = [
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
      value: 42,
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
  }),

  http.get('http://localhost:3000/api/methods', () => {
    return HttpResponse.json([
      { id: 'euler', name: 'Euler Method', description: 'First-order numerical procedure' },
      { id: 'rk4', name: 'RK4', description: 'Fourth-order Runge-Kutta method' }
    ]);
  }),

  http.get('http://localhost:3000/api/methods/:id', ({ params }) => {
    const { id } = params;
    if (id === 'euler') {
      return HttpResponse.json({
        id: 'euler',
        name: 'Euler Method',
        description: 'First-order numerical procedure',
        parameters: {
          stepSize: { type: 'number', default: 0.1 },
          initialValue: { type: 'number', default: 0 }
        }
      });
    }
    return HttpResponse.json(null, { status: 404 });
  })
]; 