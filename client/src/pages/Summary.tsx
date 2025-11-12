import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/ProgressBar';
import { GraphVisualization } from '@/components/GraphVisualization';
import { ChevronLeft } from 'lucide-react';

export default function Summary() {
  const navigate = useNavigate();
  const { state, setCurrentStep } = useAppContext();

  const handleBack = () => {
    setCurrentStep(2);
    if (state.mode === 'manual') {
      navigate('/manual-input');
    } else {
      navigate('/rtl-upload');
    }
  };

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/timing-config');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Summary & Review
        </h1>

        <StepIndicator />

        <div className="space-y-6">
          <Card className="tech-card p-8">
            <h2 className="text-xl font-semibold mb-4">Adjacency Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-2"></th>
                    {state.adjacencyMatrix[0]?.map((_, i) => (
                      <th key={i} className="border border-border p-2 bg-secondary">n{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.adjacencyMatrix.map((row, i) => (
                    <tr key={i}>
                      <th className="border border-border p-2 bg-secondary">n{i}</th>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`border border-border p-4 text-center ${
                            cell === 1 ? 'bg-accent/20' : ''
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="tech-card p-8">
            <h2 className="text-xl font-semibold mb-4">Feature Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-3 bg-secondary">Node</th>
                    <th className="border border-border p-3 bg-secondary">Fan In</th>
                    <th className="border border-border p-3 bg-secondary">Fan Out</th>
                    <th className="border border-border p-3 bg-secondary">Logic Depth</th>
                    <th className="border border-border p-3 bg-secondary">Node Category</th>
                    <th className="border border-border p-3 bg-secondary">Node Type</th>
                  </tr>
                </thead>
                <tbody>
                  {state.featureMatrix.map((feature, i) => (
                    <tr key={i}>
                      <td className="border border-border p-3 text-center font-semibold">n{i}</td>
                      <td className="border border-border p-3 text-center">{feature.fan_in}</td>
                      <td className="border border-border p-3 text-center">{feature.fan_out}</td>
                      <td className="border border-border p-3 text-center">{feature.logic_depth}</td>
                      <td className="border border-border p-3 text-center">{feature.gate_type}</td>
                      <td className="border border-border p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          feature.type === 'SEQ' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-accent/20 text-accent'
                        }`}>
                          {feature.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="tech-card p-8">
            <h2 className="text-xl font-semibold mb-6">Gate-Level Graph (Instance Connections)</h2>
            <GraphVisualization 
              adjacencyMatrix={state.adjacencyMatrix} 
              nodeCount={state.nodeCount}
              nodeLabels={state.featureMatrix.map(f => f.gate_type || '')}
            />
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2" size={16} />
            Back
          </Button>
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
