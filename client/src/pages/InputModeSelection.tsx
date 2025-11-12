import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileCode2, Pencil } from 'lucide-react';
import { StepIndicator } from '@/components/ProgressBar';
import { InputMode } from '@/types';

export default function InputModeSelection() {
  const navigate = useNavigate();
  const { state, setMode, setCurrentStep } = useAppContext();

  const handleModeSelect = (mode: InputMode) => {
    setMode(mode);
  };

  const handleNext = () => {
    setCurrentStep(2);
    if (state.mode === 'manual') {
      navigate('/manual-input');
    } else {
      navigate('/rtl-upload');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RTL Timing Violation Predictor
          </h1>
          <p className="text-muted-foreground">ML-Powered Circuit Analysis Tool</p>
        </div>

        <StepIndicator />

        <h2 className="text-2xl font-semibold mb-6 text-center">Select Input Mode</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`tech-card p-8 cursor-pointer ${state.mode === 'manual' ? 'border-accent glow-accent' : ''}`}
            onClick={() => handleModeSelect('manual')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                state.mode === 'manual' ? 'bg-accent text-accent-foreground' : 'bg-secondary'
              }`}>
                <Pencil size={32} />
              </div>
              <h3 className="text-xl font-bold">Manual Input Mode</h3>
              <p className="text-muted-foreground text-sm">
                Enter adjacency and feature data manually through our guided interface
              </p>
              <Button 
                variant={state.mode === 'manual' ? 'default' : 'outline'}
                className={state.mode === 'manual' ? 'bg-accent hover:bg-accent/90' : ''}
              >
                Select
              </Button>
            </div>
          </Card>

          <Card 
            className={`tech-card p-8 cursor-pointer ${state.mode === 'rtl' ? 'border-accent glow-accent' : ''}`}
            onClick={() => handleModeSelect('rtl')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                state.mode === 'rtl' ? 'bg-accent text-accent-foreground' : 'bg-secondary'
              }`}>
                <FileCode2 size={32} />
              </div>
              <h3 className="text-xl font-bold">RTL Code Upload</h3>
              <p className="text-muted-foreground text-sm">
                Extract data automatically from Verilog code using our parser
              </p>
              <Button 
                variant={state.mode === 'rtl' ? 'default' : 'outline'}
                className={state.mode === 'rtl' ? 'bg-accent hover:bg-accent/90' : ''}
              >
                Select
              </Button>
            </div>
          </Card>
        </div>

         <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button 
            size="lg"
            disabled={!state.mode}
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
