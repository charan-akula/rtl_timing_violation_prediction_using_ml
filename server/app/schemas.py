from pydantic import BaseModel
class VerilogInput(BaseModel):
    verilog_code: str

class PredictionInput(BaseModel):
    adjacency_matrix: list[list[int]]
    feature_matrix: list[list]
    clock_params: list[float]  # [clock_count, period, skew, jitter, in_delay, out_delay]