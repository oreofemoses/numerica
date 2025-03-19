import React from 'react';
import { render } from '@testing-library/react';
import { ResultGraph } from '../ResultGraph';

describe('ResultGraph Visual Tests', () => {
  const mockData = {
    points: Array.from({ length: 100 }, (_, i) => ({
      x: i / 100,
      y: Math.sin(i / 100 * Math.PI * 2)
    })),
    method: 'euler',
    error: 0.001
  };

  it('renders graph with correct dimensions', () => {
    const { container } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '600');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('renders correct number of data points', () => {
    const { container } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
      />
    );

    const points = container.querySelectorAll('.data-point');
    expect(points).toHaveLength(mockData.points.length);
  });

  it('renders axes with labels', () => {
    const { container } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
      />
    );

    expect(container.querySelector('.x-axis')).toBeInTheDocument();
    expect(container.querySelector('.y-axis')).toBeInTheDocument();
    expect(container.querySelector('.x-label')).toHaveTextContent('x');
    expect(container.querySelector('.y-label')).toHaveTextContent('y');
  });

  it('renders error bounds when error is provided', () => {
    const { container } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
        showErrorBounds
      />
    );

    expect(container.querySelector('.error-bound-upper')).toBeInTheDocument();
    expect(container.querySelector('.error-bound-lower')).toBeInTheDocument();
  });

  it('updates on data changes', () => {
    const { container, rerender } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
      />
    );

    const newData = {
      ...mockData,
      points: mockData.points.map(p => ({ ...p, y: p.y * 2 }))
    };

    rerender(
      <ResultGraph 
        data={newData}
        width={600}
        height={400}
      />
    );

    // Check if points have been updated
    const points = container.querySelectorAll('.data-point');
    const firstPoint = points[0];
    expect(firstPoint).toHaveAttribute('cy', expect.not.stringMatching(/0/));
  });

  it('handles empty data gracefully', () => {
    const { container } = render(
      <ResultGraph 
        data={{ ...mockData, points: [] }}
        width={600}
        height={400}
      />
    );

    expect(container.querySelector('.no-data-message')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
        loading
      />
    );

    expect(container.querySelector('.loading-overlay')).toBeInTheDocument();
  });

  it('handles zoom interactions', () => {
    const { container } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
        enableZoom
      />
    );

    expect(container.querySelector('.zoom-controls')).toBeInTheDocument();
  });

  it('renders with different color schemes', () => {
    const { container, rerender } = render(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
        theme="light"
      />
    );

    expect(container.querySelector('svg')).toHaveClass('theme-light');

    rerender(
      <ResultGraph 
        data={mockData}
        width={600}
        height={400}
        theme="dark"
      />
    );

    expect(container.querySelector('svg')).toHaveClass('theme-dark');
  });
}); 