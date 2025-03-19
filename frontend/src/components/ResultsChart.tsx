import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { selectExpression } from '../store/selectors';
import type { CalculationResult } from '../types';

interface ResultsChartProps {
  results: CalculationResult[];
  method: string;
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ results, method }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const expression = useSelector(selectExpression);

  useEffect(() => {
    if (!svgRef.current || !results.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([d3.min(results, (d: CalculationResult) => d.value) || 0, d3.max(results, (d: CalculationResult) => d.value) || 0])
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain([0, d3.max(results, (d: CalculationResult) => d.error || 0) || 0])
      .range([height, 0])
      .nice();

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Value');

    svg.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Error');

    // Add points
    svg.selectAll('circle')
      .data(results)
      .enter()
      .append('circle')
      .attr('cx', (d: CalculationResult) => x(d.value))
      .attr('cy', (d: CalculationResult) => y(d.error || 0))
      .attr('r', 5)
      .attr('fill', 'var(--pepper)')
      .attr('opacity', 0.7)
      .on('mouseover', function(this: SVGCircleElement, event: MouseEvent, d: CalculationResult) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('opacity', 1);

        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', x(d.value) + 10)
          .attr('y', y(d.error || 0) - 10)
          .attr('fill', 'var(--pepper)')
          .text(`Value: ${d.value.toFixed(6)}, Error: ${(d.error || 0).toFixed(6)}`);
      })
      .on('mouseout', function(this: SVGCircleElement) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5)
          .attr('opacity', 0.7);

        svg.selectAll('.tooltip').remove();
      });

  }, [results]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-salt rounded-lg p-6 shadow-sm"
    >
      <h3 className="text-lg font-medium text-pepper mb-4">
        Visualization for {method}
      </h3>
      <p className="text-sm text-pepper/70 mb-6">
        Expression: {expression}
      </p>
      <div className="w-full h-[400px] bg-white rounded-lg overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}; 