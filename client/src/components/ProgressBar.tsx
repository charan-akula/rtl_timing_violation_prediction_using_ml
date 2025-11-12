import { useAppContext } from '@/context/AppContext';

const steps = [
  { num: 1, label: 'Input Mode' },
  { num: 2, label: 'Data Entry' },
  { num: 3, label: 'Summary' },
  { num: 4, label: 'Timing Config' },
  { num: 5, label: 'Prediction' },
];

export const ProgressBar = () => {
  const { state } = useAppContext();
  const progress = (state.currentStep / steps.length) * 100;

  return (
    <div className="w-full bg-secondary rounded-full h-2 mb-8 overflow-hidden">
      <div 
        className="tech-gradient h-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const StepIndicator = () => {
  const { state } = useAppContext();
  
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                state.currentStep >= step.num 
                  ? 'bg-accent text-accent-foreground glow-accent' 
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {step.num}
            </div>
            <span className={`text-xs mt-2 ${state.currentStep >= step.num ? 'text-accent' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
              state.currentStep > step.num ? 'bg-accent' : 'bg-secondary'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
