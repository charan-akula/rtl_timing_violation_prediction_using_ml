import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StepIndicator } from '@/components/ProgressBar';
import { InstructionsDialog } from '@/components/InstructionsDialog';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RTLUpload() {
  const navigate = useNavigate();
  const { setNodeCount, setAdjacencyMatrix, setFeatureMatrix, setCurrentStep } = useAppContext();
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const handleExtract = async () => {
    if (!code.trim()) {
      toast.error('Please enter Verilog code');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setHasResults(false);
    
    try {
      // Call the backend API
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verilog_code: code }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Successfully extracted features
        const nodeCount = data.adjacency_matrix.length;
        setNodeCount(nodeCount);
        setAdjacencyMatrix(data.adjacency_matrix);
        
        // Convert feature matrix to the expected format
        const features = data.feature_matrix.map((f: any) => ({
          fan_in: f[0],
          fan_out: f[1],
          logic_depth: f[2],
          gate_type: f[3],
          type: ['and', 'or', 'nand', 'xor', 'nor', 'not', 'add', 'sub'].includes(f[3]) ? 'COMB' : 'SEQ'
        }));
        
        setFeatureMatrix(features);
        setHasResults(true);
        toast.success('RTL code extracted successfully');
      } else {
        // Error from backend
        setError(data.message || 'Failed to analyze the code');
        toast.error('Analysis failed');
      }
    } catch (err) {
      console.error('Error calling API:', err);
      setError('Failed to connect to the analysis service. Please try again.');
      toast.error('Connection error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(3);
    navigate('/summary');
  };

  const handleBack = () => {
    setCurrentStep(1);
    navigate('/input-mode');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          RTL Code Upload
        </h1>

        <StepIndicator />

        <Card className="tech-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Paste Your Verilog Code</h2>
            <InstructionsDialog />
          </div>
          
          <Textarea
            placeholder="Paste your Verilog RTL code here, after fully reading the instructions"
            className="font-mono h-96 mb-6"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-4 bg-secondary rounded-lg mb-6">
              <Loader2 className="animate-spin text-accent" size={20} />
              <span className="text-muted-foreground">Extracting adjacency and feature matrices from RTL...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p>{error}</p>
                  <InstructionsDialog />
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setCode('')}>
              Clear
            </Button>
            <Button 
              onClick={handleExtract} 
              disabled={isProcessing}
              className="bg-accent hover:bg-accent/90"
            >
              {isProcessing ? 'Extracting...' : 'Extract Features'}
            </Button>
            {hasResults && (
              <Button 
                onClick={handleNext} 
                className="bg-primary hover:bg-primary/90 ml-auto"
              >
                Next →
              </Button>
            )}
          </div>
        </Card>

        <div className="flex justify-start mt-6">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2" size={16} />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
