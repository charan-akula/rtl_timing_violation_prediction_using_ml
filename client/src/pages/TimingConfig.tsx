import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/ProgressBar';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ValidationRanges {
  clock_count: { min: number; max: number };
  clock_time_period: { min: number; max: number };
  clock_skew: { min: number; max: number };
  clock_jitter: { min: number; max: number };
  input_delay: { min: number; max: number };
  output_delay: { min: number; max: number };
}

const OPTIMAL_RANGES: ValidationRanges = {
  clock_count: { min: 1, max: 3 },
  clock_time_period: { min: 1, max: 20 },
  clock_skew: { min: -10, max: 10 },
  clock_jitter: { min: 0, max: 1 },
  input_delay: { min: -10, max: 10 },
  output_delay: { min: -10, max: 10 },
};

export default function TimingConfig() {
  const navigate = useNavigate();
  const { state, setTimingConfig, setCurrentStep, setPredictionResult } = useAppContext();
  const [config, setConfig] = useState(state.timingConfig);
  const [isPredicting, setIsPredicting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);

  useEffect(() => {
    const filled =
      config.clock_count !== 0 &&
      config.clock_time_period !== 0 &&
      config.clock_skew !== 0 &&
      config.clock_jitter !== 0 &&
      config.input_delay !== 0 &&
      config.output_delay !== 0;

    setAllFieldsFilled(filled);
  }, [config]);

  const handleBack = () => {
    setCurrentStep(3);
    navigate('/summary');
  };

  // ✅ Backend prediction integration
  const handlePredict = async () => {
    setTimingConfig(config);
    setIsPredicting(true);

    const predictionData = {
      adjacency_matrix: state.adjacencyMatrix,
      feature_matrix: state.featureMatrix.map(f => [
        f.fan_in,
        f.fan_out,
        f.logic_depth,
        f.gate_type.toLowerCase(),
        f.type || 0, // if available
      ]),
      clock_params: [
        config.clock_count,
        config.clock_time_period,
        config.clock_skew,
        config.clock_jitter,
        config.input_delay,
        config.output_delay,
      ],
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionData),
      });

      const result = await res.json();
      setIsPredicting(false);

      if (!res.ok) {
        // ⚠️ Handle backend errors clearly
        toast.error(
          result?.detail ||
            result?.message ||
            'Prediction failed. Please check your input data or try again.'
        );
        return;
      }

      // ✅ Success — interpret backend response
      const { output_value, confidence } = result;

      const predictionMessage =
        output_value === 0
          ? `✅ No Timing Violation Detected.\nConfidence`
          : `⚠️ Timing Violation Predicted!\nConfidence`;

      toast.success(predictionMessage, { duration: 4000 });

      // Store result in context for next page
      setPredictionResult({
        result: output_value,
        confidence: confidence,
      });

      // Go to prediction result screen
      setCurrentStep(5);
      navigate('/prediction');
    } catch (error) {
      console.error('Prediction error:', error);
      setIsPredicting(false);
      toast.error('Server unreachable or internal error. Please try again later.');
    }
  };

  const validateField = (field: keyof typeof config, value: number) => {
    const range = OPTIMAL_RANGES[field];
    const isValid = value >= range.min && value <= range.max;
    setFieldErrors(prev => ({ ...prev, [field]: !isValid }));
    return isValid;
  };

  const updateConfig = (field: keyof typeof config, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const canPredict = () =>
    allFieldsFilled && Object.keys(fieldErrors).every(key => !fieldErrors[key]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Timing Configuration
        </h1>

        <StepIndicator />

        <Card className="tech-card p-8">
          <h2 className="text-xl font-semibold mb-6">Configure Timing Parameters</h2>
          <TooltipProvider>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.keys(OPTIMAL_RANGES).map((fieldKey) => {
                const field = fieldKey as keyof typeof config;
                const label = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const step = field.includes('jitter') ? 0.01 : 0.1;
                return (
                  <div key={field}>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor={field}>{label}</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={16} className="text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Optimal range: {OPTIMAL_RANGES[field].min} to {OPTIMAL_RANGES[field].max}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id={field}
                      type="number"
                      step={step}
                      value={config[field] ?? ''}
                      onChange={(e) => updateConfig(field, parseFloat(e.target.value) || 0)}
                      className={cn(fieldErrors[field] && 'border-red-500')}
                    />
                    {fieldErrors[field] && (
                      <p className="text-xs text-red-500 mt-1">
                        Optimal range: {OPTIMAL_RANGES[field].min} - {OPTIMAL_RANGES[field].max}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        </Card>

        {isPredicting && (
          <Card className="tech-card p-6 mt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin text-accent" size={24} />
              <span className="text-lg">Running ML prediction model...</span>
            </div>
          </Card>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack} disabled={isPredicting}>
            <ChevronLeft className="mr-2" size={16} />
            Back
          </Button>
          <Button
            onClick={handlePredict}
            disabled={!canPredict() || isPredicting}
            className="bg-accent hover:bg-accent/90"
          >
            {isPredicting ? 'Predicting...' : 'Predict'}
          </Button>
        </div>
      </div>
    </div>
  );
}


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAppContext } from '@/context/AppContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { StepIndicator } from '@/components/ProgressBar';
// import { ChevronLeft, Info, Loader2 } from 'lucide-react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { toast } from 'sonner';
// import { cn } from '@/lib/utils';

// interface ValidationRanges {
//   clock_count: { min: number; max: number };
//   clock_time_period: { min: number; max: number };
//   clock_skew: { min: number; max: number };
//   clock_jitter: { min: number; max: number };
//   input_delay: { min: number; max: number };
//   output_delay: { min: number; max: number };
// }

// const OPTIMAL_RANGES: ValidationRanges = {
//   clock_count: { min: 1, max: 3 },
//   clock_time_period: { min: 1, max: 20 },
//   clock_skew: { min: -10, max: 10 },
//   clock_jitter: { min: 0, max: 1 },
//   input_delay: { min: -10, max: 10 },
//   output_delay: { min: -10, max: 10 },
// };

// export default function TimingConfig() {
//   const navigate = useNavigate();
//   const { state, setTimingConfig, setCurrentStep } = useAppContext();
//   const [config, setConfig] = useState(state.timingConfig);
//   const [isPredicting, setIsPredicting] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
//   const [allFieldsFilled, setAllFieldsFilled] = useState(false);

//   useEffect(() => {
//     // Check if all fields have been filled (user has interacted with them)
//     const filled = 
//       config.clock_count !== 0 &&
//       config.clock_time_period !== 0 &&
//       config.clock_skew !== 0 &&
//       config.clock_jitter !== 0 &&
//       config.input_delay !== 0 &&
//       config.output_delay !== 0;
    
//     setAllFieldsFilled(filled);
//   }, [config]);

//   const handleBack = () => {
//     setCurrentStep(3);
//     navigate('/summary');
//   };

//   const handlePredict = async () => {
//     setTimingConfig(config);
//     setIsPredicting(true);

//     // Prepare data for prediction
//     const predictionData = {
//       adjacency_matrix: state.adjacencyMatrix,
//       feature_matrix: state.featureMatrix.map(f => [
//         f.fan_in,
//         f.fan_out,
//         f.logic_depth,
//         f.gate_type.toLowerCase()
//       ]),
//       clock_params: [
//         config.clock_count,
//         config.clock_time_period,
//         config.clock_skew,
//         config.clock_jitter,
//         config.input_delay,
//         config.output_delay
//       ]
//     };

//     console.log('Prediction data:', predictionData);

//     // Simulate API call (replace with actual backend call)
//     setTimeout(() => {
//       setIsPredicting(false);
//       setCurrentStep(5);
//       navigate('/prediction');
//     }, 2000);
//   };

//   const validateField = (field: keyof typeof config, value: number) => {
//     const range = OPTIMAL_RANGES[field];
//     const isValid = value >= range.min && value <= range.max;
    
//     setFieldErrors(prev => ({
//       ...prev,
//       [field]: !isValid
//     }));

//     return isValid;
//   };

//   const updateConfig = (field: keyof typeof config, value: number) => {
//     setConfig(prev => ({ ...prev, [field]: value }));
//     validateField(field, value);
//   };

//   const canPredict = () => {
//     return allFieldsFilled && Object.keys(fieldErrors).every(key => !fieldErrors[key]);
//   };

//   return (
//     <div className="min-h-screen bg-background p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//           Timing Configuration
//         </h1>

//         <StepIndicator />

//         <Card className="tech-card p-8">
//           <h2 className="text-xl font-semibold mb-6">Configure Timing Parameters</h2>
          
//           <TooltipProvider>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Label htmlFor="clock_count">Clock Count</Label>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Info size={16} className="text-muted-foreground" />
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Number of clock domains in the design</p>
//                       <p className="text-xs text-muted-foreground">Optimal range: 1-5</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//                 <Input
//                   id="clock_count"
//                   type="number"
//                   value={config.clock_count || ''}
//                   onChange={(e) => updateConfig('clock_count', parseInt(e.target.value) || 0)}
//                   className={cn(fieldErrors.clock_count && 'border-red-500 bg-red-50 dark:bg-red-950/20')}
//                 />
//                 {fieldErrors.clock_count && (
//                   <p className="text-xs text-red-500 mt-1">Optimal range: 1-5</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Label htmlFor="clock_time_period">Clock Time Period (ns)</Label>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Info size={16} className="text-muted-foreground" />
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Clock period in nanoseconds</p>
//                       <p className="text-xs text-muted-foreground">Optimal range: 1-20</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//                 <Input
//                   id="clock_time_period"
//                   type="number"
//                   step={0.1}
//                   value={config.clock_time_period || ''}
//                   onChange={(e) => updateConfig('clock_time_period', parseFloat(e.target.value) || 0)}
//                   className={cn(fieldErrors.clock_time_period && 'border-red-500 bg-red-50 dark:bg-red-950/20')}
//                 />
//                 {fieldErrors.clock_time_period && (
//                   <p className="text-xs text-red-500 mt-1">Optimal range: 1-20</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Label htmlFor="clock_skew">Clock Skew (ns)</Label>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Info size={16} className="text-muted-foreground" />
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Clock skew in nanoseconds</p>
//                       <p className="text-xs text-muted-foreground">Optimal range: -10 to 10</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//                 <Input
//                   id="clock_skew"
//                   type="number"
//                   step={0.1}
//                   value={config.clock_skew || ''}
//                   onChange={(e) => updateConfig('clock_skew', parseFloat(e.target.value) || 0)}
//                   className={cn(fieldErrors.clock_skew && 'border-red-500 bg-red-50 dark:bg-red-950/20')}
//                 />
//                 {fieldErrors.clock_skew && (
//                   <p className="text-xs text-red-500 mt-1">Optimal range: -10 to 10</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Label htmlFor="clock_jitter">Clock Jitter (ns)</Label>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Info size={16} className="text-muted-foreground" />
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Clock jitter in nanoseconds</p>
//                       <p className="text-xs text-muted-foreground">Optimal range: 0 to 1</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//                 <Input
//                   id="clock_jitter"
//                   type="number"
//                   step={0.01}
//                   value={config.clock_jitter || ''}
//                   onChange={(e) => updateConfig('clock_jitter', parseFloat(e.target.value) || 0)}
//                 />
//                 {fieldErrors.clock_jitter && (
//                   <p className="text-xs text-red-500 mt-1">Optimal range: 0 to 1</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Label htmlFor="input_delay">Input Delay (ns)</Label>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Info size={16} className="text-muted-foreground" />
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Input delay in nanoseconds</p>
//                       <p className="text-xs text-muted-foreground">Optimal range: -10 to 10</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//                 <Input
//                   id="input_delay"
//                   type="number"
//                   step={0.1}
//                   value={config.input_delay || ''}
//                   onChange={(e) => updateConfig('input_delay', parseFloat(e.target.value) || 0)}
//                   className={cn(fieldErrors.input_delay && 'border-red-500 bg-red-50 dark:bg-red-950/20')}
//                 />
//                 {fieldErrors.input_delay && (
//                   <p className="text-xs text-red-500 mt-1">Optimal range: -10 to 10</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Label htmlFor="output_delay">Output Delay (ns)</Label>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Info size={16} className="text-muted-foreground" />
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Output delay in nanoseconds</p>
//                       <p className="text-xs text-muted-foreground">Optimal range: -10 to 10</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//                 <Input
//                   id="output_delay"
//                   type="number"
//                   step={0.1}
//                   value={config.output_delay || ''}
//                   onChange={(e) => updateConfig('output_delay', parseFloat(e.target.value) || 0)}
//                   className={cn(fieldErrors.output_delay && 'border-red-500 bg-red-50 dark:bg-red-950/20')}
//                 />
//                 {fieldErrors.output_delay && (
//                   <p className="text-xs text-red-500 mt-1">Optimal range: -10 to 10</p>
//                 )}
//               </div>
//             </div>
//           </TooltipProvider>
//         </Card>

//         {isPredicting && (
//           <Card className="tech-card p-6 mt-6">
//             <div className="flex items-center justify-center gap-3">
//               <Loader2 className="animate-spin text-accent" size={24} />
//               <span className="text-lg">Running ML prediction model...</span>
//             </div>
//           </Card>
//         )}

//         <div className="flex justify-between mt-8">
//           <Button variant="outline" onClick={handleBack} disabled={isPredicting}>
//             <ChevronLeft className="mr-2" size={16} />
//             Back
//           </Button>
//           <Button 
//             onClick={handlePredict} 
//             disabled={!canPredict() || isPredicting}
//             className="bg-accent hover:bg-accent/90"
//           >
//             {isPredicting ? 'Predicting...' : 'Predict'}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
