import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Suppress console.log during tests
global.console.log = jest.fn(); 