import { LucideIcon } from 'lucide-react';

export interface Parameter {
  name: string;
  label: string;
  type: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface ParameterSet {
  [key: string]: Parameter;
}

export interface MethodConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  algorithms: string[];
  algorithmParameters?: {
    [algorithm: string]: ParameterSet;
  };
  parameters?: ParameterSet; // For methods that don't have algorithm-specific parameters
}

export interface CalculationResult {
  method: string;
  value: number;
  error: number;
  iterations?: number;
  points?: Array<{ x: number; y: number }>;
} 