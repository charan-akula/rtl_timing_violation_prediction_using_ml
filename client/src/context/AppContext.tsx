import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, InputMode, NodeFeatures, TimingConfig } from '@/types';

interface PredictionResult {
  result: number;        // 0 = no violation, 1 = violation
  confidence: number;    // confidence score from backend
  error?: string;        // optional error message if backend fails
}

interface AppContextType {
  state: AppState;
  setMode: (mode: InputMode) => void;
  setNodeCount: (count: number) => void;
  setAdjacencyMatrix: (matrix: number[][]) => void;
  setFeatureMatrix: (features: NodeFeatures[]) => void;
  setTimingConfig: (config: TimingConfig) => void;
  setCurrentStep: (step: number) => void;
  resetState: () => void;
  setPredictionResult: (result: PredictionResult | null) => void;  // 🆕 add this
}

const defaultState: AppState & { predictionResult?: PredictionResult | null } = {
  mode: null,
  nodeCount: 0,
  adjacencyMatrix: [],
  featureMatrix: [],
  timingConfig: {
    clock_count: 1,
    clock_time_period: 10,
    clock_skew: 0,
    clock_jitter: 0,
    input_delay: 0,
    output_delay: 0,
  },
  currentStep: 1,
  predictionResult: null, // 🆕 new field in default state
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('rtl-predictor-state');
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('rtl-predictor-state', JSON.stringify(state));
  }, [state]);

  const setMode = (mode: InputMode) => setState(prev => ({ ...prev, mode }));
  const setNodeCount = (nodeCount: number) => setState(prev => ({ ...prev, nodeCount }));
  const setAdjacencyMatrix = (adjacencyMatrix: number[][]) => setState(prev => ({ ...prev, adjacencyMatrix }));
  const setFeatureMatrix = (featureMatrix: NodeFeatures[]) => setState(prev => ({ ...prev, featureMatrix }));
  const setTimingConfig = (timingConfig: TimingConfig) => setState(prev => ({ ...prev, timingConfig }));
  const setCurrentStep = (currentStep: number) => setState(prev => ({ ...prev, currentStep }));
  
  // 🆕 Set prediction result (from backend)
  const setPredictionResult = (predictionResult: PredictionResult | null) =>
    setState(prev => ({ ...prev, predictionResult }));

  const resetState = () => {
    setState(defaultState);
    localStorage.removeItem('rtl-predictor-state');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setMode,
        setNodeCount,
        setAdjacencyMatrix,
        setFeatureMatrix,
        setTimingConfig,
        setCurrentStep,
        resetState,
        setPredictionResult, // 🆕 included here
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { AppState, InputMode, NodeFeatures, TimingConfig } from '@/types';

// interface AppContextType {
//   state: AppState;
//   setMode: (mode: InputMode) => void;
//   setNodeCount: (count: number) => void;
//   setAdjacencyMatrix: (matrix: number[][]) => void;
//   setFeatureMatrix: (features: NodeFeatures[]) => void;
//   setTimingConfig: (config: TimingConfig) => void;
//   setCurrentStep: (step: number) => void;
//   resetState: () => void;
// }

// const defaultState: AppState = {
//   mode: null,
//   nodeCount: 0,
//   adjacencyMatrix: [],
//   featureMatrix: [],
//   timingConfig: {
//     clock_count: 1,
//     clock_time_period: 10,
//     clock_skew: 0,
//     clock_jitter: 0,
//     input_delay: 0,
//     output_delay: 0,
//   },
//   currentStep: 1,
// };

// const AppContext = createContext<AppContextType | undefined>(undefined);

// export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [state, setState] = useState<AppState>(() => {
//     const saved = localStorage.getItem('rtl-predictor-state');
//     return saved ? JSON.parse(saved) : defaultState;
//   });

//   useEffect(() => {
//     localStorage.setItem('rtl-predictor-state', JSON.stringify(state));
//   }, [state]);

//   const setMode = (mode: InputMode) => setState(prev => ({ ...prev, mode }));
//   const setNodeCount = (nodeCount: number) => setState(prev => ({ ...prev, nodeCount }));
//   const setAdjacencyMatrix = (adjacencyMatrix: number[][]) => setState(prev => ({ ...prev, adjacencyMatrix }));
//   const setFeatureMatrix = (featureMatrix: NodeFeatures[]) => setState(prev => ({ ...prev, featureMatrix }));
//   const setTimingConfig = (timingConfig: TimingConfig) => setState(prev => ({ ...prev, timingConfig }));
//   const setCurrentStep = (currentStep: number) => setState(prev => ({ ...prev, currentStep }));
//   const resetState = () => {
//     setState(defaultState);
//     localStorage.removeItem('rtl-predictor-state');
//   };

//   return (
//     <AppContext.Provider value={{
//       state,
//       setMode,
//       setNodeCount,
//       setAdjacencyMatrix,
//       setFeatureMatrix,
//       setTimingConfig,
//       setCurrentStep,
//       resetState,
//     }}>
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useAppContext = () => {
//   const context = useContext(AppContext);
//   if (!context) throw new Error('useAppContext must be used within AppProvider');
//   return context;
// };
