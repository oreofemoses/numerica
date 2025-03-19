import { useEffect } from 'react';
import { Calculator, GitBranch, Infinity, Play, LineChart, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MethodForm } from './components/MethodForm';
import { ResultsChart } from './components/ResultsChart';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedMethod } from './store/slices/calculationSlice';
import { setActiveTab } from './store/slices/uiSlice';
import { selectSelectedMethod, selectExpression, selectResults, selectActiveTab } from './store/selectors';
import type { RootState } from './store/store';
import type { CalculationResult } from './types';

const methodConfigs = {
  'root-finding': {
    id: 'root-finding',
    name: 'Root Finding',
    icon: GitBranch,
    description: 'Find zeros of functions',
    algorithms: ['newton', 'bisection', 'secant'],
    algorithmParameters: {
      newton: {
        initialGuess: {
          name: 'initialGuess',
          label: 'Initial Guess',
          type: 'number',
          default: 0,
        },
        tolerance: {
          name: 'tolerance',
          label: 'Tolerance',
          type: 'number',
          default: 1e-6,
          min: 1e-10,
          max: 1e-2,
          step: 1e-6,
        }
      },
      bisection: {
        lowerBound: {
          name: 'lowerBound',
          label: 'Lower Bound',
          type: 'number',
          default: -2,
        },
        upperBound: {
          name: 'upperBound',
          label: 'Upper Bound',
          type: 'number',
          default: 2,
        },
        tolerance: {
          name: 'tolerance',
          label: 'Tolerance',
          type: 'number',
          default: 1e-6,
          min: 1e-10,
          max: 1e-2,
          step: 1e-6,
        }
      },
      secant: {
        firstGuess: {
          name: 'firstGuess',
          label: 'First Point',
          type: 'number',
          default: 0,
        },
        secondGuess: {
          name: 'secondGuess',
          label: 'Second Point',
          type: 'number',
          default: 1,
        },
        tolerance: {
          name: 'tolerance',
          label: 'Tolerance',
          type: 'number',
          default: 1e-6,
          min: 1e-10,
          max: 1e-2,
          step: 1e-6,
        }
      },
    },
  },
  'differentiation': {
    id: 'differentiation',
    name: 'Differentiation',
    icon: Calculator,
    description: 'Calculate derivatives',
    algorithms: ['forward', 'central', 'backward'],
    parameters: {
      point: {
        name: 'point',
        label: 'Point',
        type: 'number',
        default: 0,
      },
      stepSize: {
        name: 'stepSize',
        label: 'Step Size',
        type: 'number',
        default: 1e-6,
        min: 1e-10,
        max: 1e-2,
        step: 1e-6,
      }
    },
  },
  'integration': {
    id: 'integration',
    name: 'Integration',
    icon: Infinity,
    description: 'Compute definite integrals',
    algorithms: ['trapezoidal', 'simpson', 'midpoint'],
    parameters: {
      lowerBound: {
        name: 'lowerBound',
        label: 'Lower Bound',
        type: 'number',
        default: -1,
      },
      upperBound: {
        name: 'upperBound',
        label: 'Upper Bound',
        type: 'number',
        default: 1,
      },
      numPoints: {
        name: 'numPoints',
        label: 'Number of Points',
        type: 'number',
        default: 100,
        min: 10,
        max: 1000,
        step: 10,
      }
    },
  },
};

const App = () => {
  const dispatch = useDispatch();
  const selectedMethod = useSelector(selectSelectedMethod);
  const expression = useSelector(selectExpression);
  const results = useSelector(selectResults) as CalculationResult[];
  const activeTab = useSelector(selectActiveTab);

  const currentConfig = methodConfigs[selectedMethod as keyof typeof methodConfigs];

  // Reset to parameters tab when changing methods
  useEffect(() => {
    dispatch(setActiveTab('parameters'));
  }, [selectedMethod, dispatch]);

  const TabButton = ({ tab, icon: Icon, label }: { tab: typeof activeTab; icon: any; label: string }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => dispatch(setActiveTab(tab))}
      className={`
        flex items-center space-x-2 px-6 py-3 rounded-lg transition-all
        ${activeTab === tab
          ? 'bg-pepper text-salt shadow-lg'
          : 'text-pepper/70 hover:bg-salt-muted/10'
        }
      `}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-salt to-salt-muted/20">
      {/* Header */}
      <header className="bg-salt/80 backdrop-blur-sm sticky top-0 z-50 border-b border-salt-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="bg-gradient-to-br from-pepper to-pepper/90 p-3 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calculator className="h-7 w-7 text-salt" />
              </motion.div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pepper to-pepper/70 bg-clip-text text-transparent">
                  Numerica
                </h1>
                <span className="text-pepper/30">/</span>
                <motion.span
                  key={selectedMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-medium text-pepper/70"
                >
                  {currentConfig.name}
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Method Selection */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {Object.values(methodConfigs).map((method, index) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(setSelectedMethod(method.id as any))}
              className={`
                flex items-center p-6 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md
                ${selectedMethod === method.id
                  ? 'border-pepper bg-gradient-to-br from-salt to-salt-muted/20'
                  : 'border-salt-muted/20 hover:border-pepper/50'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  selectedMethod === method.id 
                    ? 'bg-gradient-to-br from-pepper to-pepper/90' 
                    : 'bg-salt-muted/10'
                }`}>
                  <method.icon className={`h-7 w-7 ${
                    selectedMethod === method.id ? 'text-salt' : 'text-pepper/70'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className={`text-lg font-medium ${
                    selectedMethod === method.id ? 'text-pepper' : 'text-pepper/70'
                  }`}>
                    {method.name}
                  </h3>
                  <p className="text-sm text-pepper/50 mt-1">{method.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Main Card */}
        <motion.div 
          className="bg-salt rounded-2xl shadow-xl overflow-hidden border border-salt-muted/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Tabs */}
          <div className="border-b border-salt-muted/20 bg-gradient-to-br from-salt to-salt-muted/5">
            <div className="flex space-x-3 p-4">
              <TabButton tab="parameters" icon={Sliders} label="Parameters" />
              <TabButton tab="results" icon={Calculator} label="Results" />
              <TabButton tab="visualization" icon={LineChart} label="Visualization" />
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'parameters' && (
                <motion.div
                  key="parameters"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <MethodForm methodConfig={currentConfig} onCalculate={() => dispatch(setActiveTab('results'))} />
                </motion.div>
              )}

              {activeTab === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {results.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-salt-muted/20">
                      <table className="min-w-full divide-y divide-salt-muted/20">
                        <thead className="bg-salt-muted/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-pepper/50 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-pepper/50 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-pepper/50 uppercase tracking-wider">Error</th>
                          </tr>
                        </thead>
                        <tbody className="bg-salt divide-y divide-salt-muted/20">
                          {results.map((result, index) => (
                            <tr key={index} className="hover:bg-salt-muted/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pepper">{result.method}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-pepper/70 font-mono">{result.value.toExponential(6)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-pepper/70 font-mono">{result.error?.toExponential(6) || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-pepper/50 py-16 bg-salt-muted/5 rounded-xl border border-salt-muted/20">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-pepper/30" />
                      <p className="text-lg">No results available</p>
                      <p className="text-sm mt-2">Run a calculation first</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'visualization' && (
                <motion.div
                  key="visualization"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {results.length > 0 ? (
                    <ResultsChart
                      results={results}
                      method={selectedMethod}
                    />
                  ) : (
                    <div className="h-[400px] flex items-center justify-center bg-salt-muted/5 rounded-xl border border-salt-muted/20">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-4 text-pepper/30" />
                        <p className="text-lg text-pepper/50">No data to visualize</p>
                        <p className="text-sm text-pepper/40 mt-2">Run a calculation to see the visualization</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-salt/80 backdrop-blur-sm border-t border-salt-muted/20 p-4">
          <div className="flex space-x-2">
            <TabButton tab="parameters" icon={Sliders} label="Parameters" />
            <TabButton tab="results" icon={Calculator} label="Results" />
            <TabButton tab="visualization" icon={LineChart} label="Visualization" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;