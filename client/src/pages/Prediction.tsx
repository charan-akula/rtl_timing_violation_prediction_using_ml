import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/ProgressBar';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function Prediction() {
  const navigate = useNavigate();
  const { state, resetState, setCurrentStep } = useAppContext();
  const [showSummary, setShowSummary] = useState(false);

  // ✅ Get the stored backend result from context
  const { result, confidence } = state.predictionResult || {};
  const hasViolation = result === 1;

  const handleRunAnother = () => {
    resetState();
    setCurrentStep(1);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Prediction Result
        </h1>

        <StepIndicator />

        <Card className="tech-card p-12 text-center mb-6">
          <div className="flex flex-col items-center space-y-6">
            {hasViolation ? (
              <>
                <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center glow-accent">
                  <AlertCircle size={48} className="text-destructive" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-destructive mb-2">Timing Violation Predicted</h2>
                  <p className="text-muted-foreground">The ML model has detected potential timing violations in your design</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center glow-accent">
                  <CheckCircle2 size={48} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-accent mb-2">No Timing Violation Detected</h2>
                  <p className="text-muted-foreground">Your design appears to meet timing requirements</p>
                </div>
              </>
            )}
            
          {/* <div className="text-sm text-muted-foreground">
            Confidence Score: {(confidence*100)}%
          </div> */}
          </div>
        </Card>

        <Collapsible open={showSummary} onOpenChange={setShowSummary}>
          <Card className="tech-card p-6 mb-6"> 
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">View Input Summary</h3>
              {showSummary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Adjacency Matrix</h4>
                <div className="bg-secondary p-4 rounded-lg overflow-x-auto">
                  <div className="bg-secondary p-4 rounded-lg overflow-x-auto">
                    <table className="border-collapse text-xs w-full text-center">
                      <tbody>
                        {state.adjacencyMatrix.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="border border-muted-foreground/20 px-2 py-1 w-8 h-8"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Feature Matrix</h4>
                <div className="bg-secondary p-4 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Node</th>
                        <th className="text-left p-2">Fan In</th>
                        <th className="text-left p-2">Fan Out</th>
                        <th className="text-left p-2">Depth</th>
                        <th className="text-left p-2">Gate</th>
                        <th className="text-left p-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.featureMatrix.map((f, i) => (
                        <tr key={i}>
                          <td className="p-2">n{i}</td>
                          <td className="p-2">{f.fan_in}</td>
                          <td className="p-2">{f.fan_out}</td>
                          <td className="p-2">{f.logic_depth}</td>
                          <td className="p-2">{f.gate_type}</td>
                          <td className="p-2">{f.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Timing Configuration</h4>
                <div className="bg-secondary p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Clock Count: {state.timingConfig.clock_count}</div>
                    <div>Clock Period: {state.timingConfig.clock_time_period} ns</div>
                    <div>Clock Skew: {state.timingConfig.clock_skew} ns</div>
                    <div>Clock Jitter: {state.timingConfig.clock_jitter} ns</div>
                    <div>Input Delay: {state.timingConfig.input_delay} ns</div>
                    <div>Output Delay: {state.timingConfig.output_delay} ns</div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div className="flex justify-center">
          <Button 
            onClick={handleRunAnother}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            Run Another Prediction
          </Button>
        </div>
      </div>
    </div>
  );
}
