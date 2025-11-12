import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepIndicator } from '@/components/ProgressBar';
import { NodeFeatures, GateType, NodeType } from '@/types';
import { Info } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
export default function ManualInput() {
  const navigate = useNavigate();
  const {
    state,
    setNodeCount,
    setAdjacencyMatrix,
    setFeatureMatrix,
    setCurrentStep
  } = useAppContext();
  const [step, setStep] = useState<'count' | 'adjacency' | 'features'>('count');
  const [tempNodeCount, setTempNodeCount] = useState(state.nodeCount || 4);
  const [adjacency, setAdjacency] = useState<number[][]>(state.adjacencyMatrix.length > 0 ? state.adjacencyMatrix : Array(tempNodeCount).fill(null).map(() => Array(tempNodeCount).fill(0)));
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [features, setFeatures] = useState<NodeFeatures[]>(state.featureMatrix.length > 0 ? state.featureMatrix : Array(tempNodeCount).fill(null).map(() => ({
    fan_in: 0,
    fan_out: 0,
    logic_depth: 0,
    gate_type: '' as GateType,
    type: 'COMB' as NodeType
  })));
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const handleNodeCountSubmit = () => {
    if (tempNodeCount < 2 || tempNodeCount > 7) {
      toast.error('Node count must be between 2 and 7');
      return;
    }
    setNodeCount(tempNodeCount);
    const newAdjacency = Array(tempNodeCount).fill(null).map(() => Array(tempNodeCount).fill(0));
    setAdjacency(newAdjacency);
    const newFeatures = Array(tempNodeCount).fill(null).map(() => ({
      fan_in: 0,
      fan_out: 0,
      logic_depth: 0,
      gate_type: '' as GateType,
      type: 'COMB' as NodeType
    }));
    setFeatures(newFeatures);
    setValidationErrors({});
    setStep('adjacency');
  };
  const toggleEdge = (from: number, to: number) => {
    const newAdjacency = adjacency.map(row => [...row]);
    newAdjacency[from][to] = newAdjacency[from][to] === 1 ? 0 : 1;
    setAdjacency(newAdjacency);
  };
  const handleAdjacencyNext = () => {
    const hasConnection = adjacency.some(row => row.some(cell => cell === 1));
    if (!hasConnection) {
      toast.error('At least one connection is required');
      return;
    }
    setAdjacencyMatrix(adjacency);
    setStep('features');
  };
  const getNodeTypeFromGate = (gateType: GateType): NodeType => {
    const combGates = ['and', 'or', 'nand', 'xor', 'nor', 'not', 'add', 'sub'];
    return combGates.includes(gateType) ? 'COMB' : 'SEQ';
  };
  const updateFeature = (nodeIndex: number, field: keyof NodeFeatures, value: any) => {
    const newFeatures = [...features];
    if (field === 'gate_type') {
      newFeatures[nodeIndex] = {
        ...newFeatures[nodeIndex],
        gate_type: value,
        type: value ? getNodeTypeFromGate(value) : 'COMB'
      };
    } else {
      newFeatures[nodeIndex] = {
        ...newFeatures[nodeIndex],
        [field]: value
      };
    }
    setFeatures(newFeatures);
    validateFeatures(newFeatures);
  };
  const validateFeatures = (featuresToValidate: NodeFeatures[]) => {
    const errors: {
      [key: string]: boolean;
    } = {};
    const maxValue = tempNodeCount - 1;
    featuresToValidate.forEach((feature, index) => {
      if (feature.fan_in < 0 || feature.fan_in > maxValue) {
        errors[`${index}-fan_in`] = true;
      }
      if (feature.fan_out < 0 || feature.fan_out > maxValue) {
        errors[`${index}-fan_out`] = true;
      }
      if (feature.logic_depth < 0 || feature.logic_depth > maxValue) {
        errors[`${index}-logic_depth`] = true;
      }
      if (!feature.gate_type) {
        errors[`${index}-gate_type`] = true;
      }
    });
    setValidationErrors(errors);
  };
  const hasSeqNode = features.some(f => f.type === 'SEQ');

  // const canProceedToSummary = () => {
  //   // Only check if there are validation errors, don't revalidate during render
  //   return Object.keys(validationErrors).length === 0 && features.every(f => f.gate_type !== '');
  // };
  const canProceedToSummary = () => {
  const noValidationErrors = Object.keys(validationErrors).length === 0;
  const allGateTypesChosen = features.every(f => f.gate_type !== '');
  return noValidationErrors && allGateTypesChosen && hasSeqNode; // <- require at least one SEQ
};

  // const handleFeaturesNext = () => {
  //   if (!canProceedToSummary()) {
  //     toast.error('Please fill all fields correctly. Values must be between 0 and ' + (tempNodeCount - 1));
  //     return;
  //   }
  //   setFeatureMatrix(features);
  //   setCurrentStep(3);
  //   navigate('/summary');
  // };

  const handleFeaturesNext = () => {
    const noValidationErrors = Object.keys(validationErrors).length === 0;
    const allGateTypesChosen = features.every(f => f.gate_type !== '');
    const allFieldsFilled =
      features.every(
        (f) =>
          f.fan_in !== null &&
          f.fan_out !== null &&
          f.logic_depth !== null &&
          f.gate_type !== ''
      );
    const hasSeqNode = features.some(f => f.type === 'SEQ');

    // Case 1: Missing or invalid fields
    if (!noValidationErrors || !allFieldsFilled || !allGateTypesChosen) {
      toast.error(
        `Please fill all fields correctly. Values must be between 0 and ${
          tempNodeCount - 1
        }`
      );
      return;
    }

    // Case 2: No SEQ node
    if (!hasSeqNode) {
      toast.error('At least one node should be sequential (SEQ)');
      return;
    }

    // Case 3: All good
    setFeatureMatrix(features);
    setCurrentStep(3);
    navigate('/summary');
  };



  const handleBack = () => {
    if (step === 'features') {
      setStep('adjacency');
    } else if (step === 'adjacency') {
      setStep('count');
    } else {
      setCurrentStep(1);
      navigate('/input-mode');
    }
  };
  return <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Manual Input Mode
        </h1>

        <StepIndicator />

        {step === 'count' && <Card className="tech-card p-8">
            <h2 className="text-xl font-semibold mb-6">Define Your RTL Graph</h2>
            <p className="text-muted-foreground mb-6">How many nodes (logic elements) does your RTL graph have?</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nodeCount">Number of Nodes</Label>
                <p className="text-sm text-muted-foreground mb-2">Enter a value between 2 and 7</p>
                <Input id="nodeCount" type="number" min={2} max={7} value={tempNodeCount} onChange={e => setTempNodeCount(parseInt(e.target.value) || 2)} className="mt-2" />
              </div>

              <div className="bg-secondary/50 border border-border rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Info className="text-primary mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      What are nodes?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Nodes represent individual logic elements in your RTL design, such as gates (AND, OR, NAND, etc.) or flip-flops (DFF). Each node will have connections to other nodes and specific characteristics like fan-in, fan-out, and logic depth.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleNodeCountSubmit} className="bg-accent hover:bg-accent/90 mt-6">Continue.</Button>
            </div>
          </Card>}

        {step === 'adjacency' && <Card className="tech-card p-8">
            <h2 className="text-xl font-semibold mb-6">Build Adjacency Graph</h2>
            <p className="text-muted-foreground mb-6">Click on cells to toggle connections (1 = connected, 0 = not connected)</p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-2"></th>
                    {Array.from({
                  length: tempNodeCount
                }, (_, i) => <th key={i} className="border border-border p-2 bg-secondary">n{i}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {adjacency.map((row, i) => <tr key={i}>
                      <th className="border border-border p-2 bg-secondary">n{i}</th>
                      {row.map((cell, j) => <td key={j} onClick={() => toggleEdge(i, j)} className={`border border-border p-4 text-center cursor-pointer transition-colors ${cell === 1 ? 'bg-accent text-accent-foreground hover:bg-accent/80' : 'hover:bg-secondary'}`}>
                          {cell}
                        </td>)}
                    </tr>)}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setAdjacency(Array(tempNodeCount).fill(null).map(() => Array(tempNodeCount).fill(0)))}>
                Clear All
              </Button>
              <Button onClick={handleAdjacencyNext} className="bg-accent hover:bg-accent/90">
                Next →
              </Button>
            </div>
          </Card>}

        {step === 'features' && <Card className="tech-card p-8">
            <h2 className="text-xl font-semibold mb-6">Node Features Matrix</h2>
            <p className="text-muted-foreground mb-6">
              Fill in the features for all nodes. Values for fan-in, fan-out, and logic depth must be between 0 and {tempNodeCount - 1}.
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-3 bg-secondary text-center">Node</th>
                    <th className="border border-border p-3 bg-secondary text-center">Fan In</th>
                    <th className="border border-border p-3 bg-secondary text-center">Fan Out</th>
                    <th className="border border-border p-3 bg-secondary text-center">Logic Depth</th>
                    <th className="border border-border p-3 bg-secondary text-center">Node Category</th>
                    <th className="border border-border p-3 bg-secondary text-center">Node Type</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => <tr key={i}>
                      <td className="border border-border p-3 text-center font-semibold">n{i}</td>
                      <td className="border border-border p-2">
                        <Input type="number" min={0} max={tempNodeCount - 1} value={feature.fan_in} onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                    updateFeature(i, 'fan_in', isNaN(val) ? 0 : val);
                  }} className={validationErrors[`${i}-fan_in`] ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''} />
                      </td>
                      <td className="border border-border p-2">
                        <Input type="number" min={0} max={tempNodeCount - 1} value={feature.fan_out} onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                    updateFeature(i, 'fan_out', isNaN(val) ? 0 : val);
                  }} className={validationErrors[`${i}-fan_out`] ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''} />
                      </td>
                      <td className="border border-border p-2">
                        <Input type="number" min={0} max={tempNodeCount - 1} value={feature.logic_depth} onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                    updateFeature(i, 'logic_depth', isNaN(val) ? 0 : val);
                  }} className={validationErrors[`${i}-logic_depth`] ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''} />
                      </td>
                      <td className="border border-border p-2">
                        <Select value={feature.gate_type} onValueChange={value => updateFeature(i, 'gate_type', value as GateType)}>
                          <SelectTrigger className={validationErrors[`${i}-gate_type`] ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">and</SelectItem>
                            <SelectItem value="or">or</SelectItem>
                            <SelectItem value="nand">nand</SelectItem>
                            <SelectItem value="xor">xor</SelectItem>
                            <SelectItem value="nor">nor</SelectItem>
                            <SelectItem value="not">not</SelectItem>
                            <SelectItem value="dff">dff</SelectItem>
                            <SelectItem value="reg">reg</SelectItem>
                            <SelectItem value="srff">srff</SelectItem>
                            <SelectItem value="tff">tff</SelectItem>
                            <SelectItem value="jff">jff</SelectItem>
                            <SelectItem value="add">add</SelectItem>
                            <SelectItem value="sub">sub</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-border p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${feature.type === 'SEQ' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                          {feature.type}
                        </span>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* {Object.keys(validationErrors).length > 0 && <div className="bg-red-50 dark:bg-red-950/20 border border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                <p className="font-semibold">Please fix the following errors:</p>
                <p className="text-sm mt-1">
                  All fields must be filled correctly. Fan-in, fan-out, and logic depth must be between 0 and {tempNodeCount - 1}. Please select a valid gate type.
                </p>
              </div>}           */}

          <div className="flex justify-end gap-4">
            <Button onClick={handleFeaturesNext} className="bg-accent hover:bg-accent/90">
              Next →
            </Button>
          </div>
          </Card>}

        <div className="flex justify-start mt-6">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2" size={16} />
            Back
          </Button>
        </div>
      </div>
    </div>;
}