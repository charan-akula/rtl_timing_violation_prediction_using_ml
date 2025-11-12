export type InputMode = 'manual' | 'rtl' | null;

export type GateType = 'and' | 'or' | 'nand' | 'xor' | 'nor' | 'not' | 'dff' | 'reg' | 'srff' | 'tff' | 'jff' | 'add' | 'sub' | '';

export type NodeType = 'SEQ' | 'COMB';

export interface NodeFeatures {
  fan_in: number;
  fan_out: number;
  logic_depth: number;
  gate_type: GateType;
  type: NodeType;
}

export interface TimingConfig {
  clock_count: number;
  clock_time_period: number;
  clock_skew: number;
  clock_jitter: number;
  input_delay: number;
  output_delay: number;
}

export interface AppState {
  mode: InputMode;
  nodeCount: number;
  adjacencyMatrix: number[][];
  featureMatrix: NodeFeatures[];
  timingConfig: TimingConfig;
  currentStep: number;
  predictionResult?: {
    result: number;
    confidence: number;
    error?: string;
  } | null;
}
