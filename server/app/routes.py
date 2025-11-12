from fastapi import APIRouter, Form,HTTPException , UploadFile, File
from fastapi.responses import JSONResponse
from io import BytesIO
import base64
from app.matrices import analyze_verilog
from app.schemas import VerilogInput,PredictionInput
import numpy as np
import joblib


label_map = {
    'and': 0,
    'or': 1,
    'nand': 2,
    'nor': 3,
    'xor': 4,
    'not': 5,
    'dff': 6,
    'reg': 6,
    'srff': 7,
    'tff': 8,
    'jff': 9,
    'add': 10,
    'sub': 11
}


router = APIRouter(tags=["Verilog & Violation-Prediction Routes"])

@router.post("/analyze")
async def analyze_code(data: VerilogInput):
    """
    Takes Verilog RTL code (string) and returns:
    - adjacency matrix
    - feature matrix
    - instance list (with index)
    - base64 graph image for direct frontend display
    """
    verilog_code = data.verilog_code

    try:
        # Run analysis
        fea_matrix, adj_matrix, buf, instances = analyze_verilog(verilog_code)

        # Validate that analysis produced results
        if not fea_matrix or not adj_matrix:
            return JSONResponse(
                content={
                    "status": "error",
                    "message": (
                        "No valid gate-level structure detected. "
                        "Please follow the instructions and provide a valid gate-level Verilog code."
                    )
                },
                status_code=400,
            )

        # --- Validate adjacency matrix size ---
        n_nodes = len(adj_matrix)

        if n_nodes == 1:
            return JSONResponse(
                content={
                    "status": "error",
                    "message": (
                        "This model requires a minimum of 2 nodes in the circuit. "
                        "Your code has only 1 node. Please modify your design to include more gate-level instances "
                        "as per the provided instructions."
                    )
                },
                status_code=400,
            )

        elif n_nodes > 7:
            return JSONResponse(
                content={
                    "status": "error",
                    "message": (
                        "This model supports a maximum of 7 nodes (instances) only. "
                        f"Your code contains {n_nodes} nodes. "
                        "Please simplify or reduce your design to meet this limit as per the given guidelines."
                    )
                },
                status_code=400,
            )


        # Prepare response
        response_data = {
            "status": "success",
            "instances": [{"index": i, "name": inst} for i, inst in enumerate(instances)],
            "adjacency_matrix": adj_matrix,
            "feature_matrix": fea_matrix,
        }

        return JSONResponse(content=response_data)

    except Exception as e:
        return JSONResponse(
            content={
                "status": "error",
                "message": (
                    f"Analysis failed: {str(e)}. "
                )
            },
            status_code=500,
        )


@router.post("/predict")
async def predict_timing_violation(data: PredictionInput):
    """
    Predict timing violation using pre-trained Decision Tree model.
    """
    model = joblib.load('decision_tree_model.pkl')

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    try:
        adj = data.adjacency_matrix
        feat = data.feature_matrix
        timing = data.clock_params

        # --- Validate shapes ---
        n_nodes = len(adj)
        if n_nodes < 2 or n_nodes > 7:
            raise HTTPException(status_code=400, detail="Node count must be between 2 and 7.")

        # Flatten adjacency matrix
        flat_mat1 = [item for row in adj for item in row]

        # Process feature matrix
        processed_feat = []
        for row in feat:
            if len(row) < 5:
                raise HTTPException(status_code=400, detail="Feature matrix rows must have 5 elements.")
            fan_in, fan_out, logic_depth, gate, seq_comb = row

            # Convert gate label to lowercase and encode
            gate_code = label_map.get(str(gate).lower(), 0)

            # Drop seq/comb column, only keep first 4
            processed_feat.append([fan_in, fan_out, logic_depth, gate_code])

        flat_mat2 = [item for row in processed_feat for item in row]

        # Pad to fixed length (49 for adj, 28 for feat)
        flat_mat1 = flat_mat1[:49] + [0] * (49 - len(flat_mat1))
        flat_mat2 = flat_mat2[:28] + [0] * (28 - len(flat_mat2))

        # Combine and append timing config
        et = flat_mat1 + flat_mat2
        full_input = et + timing

        if len(full_input) != 83:
            raise HTTPException(status_code=400, detail=f"Invalid input size: {len(full_input)}, expected 83")

        # Convert to numpy array
        X = np.array(full_input).reshape(1, -1)

        # Predict
        output = model.predict(X)
        result = int(output[0])
        proba = model.predict_proba(X)[0]
        confidence = float(max(proba))  # take the higher class probability
        return {"status": "success", "output_value": result,"confidence":confidence}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/analyze2")
async def analyze_code(data: VerilogInput):
    """
    Takes Verilog RTL code (string) and returns:
    - adjacency matrix
    - feature matrix
    - instance list (with index)
    - base64 graph image for direct frontend display
    """
    verilog_code = data.verilog_code
    fea_matrix, adj_matrix, buf, instances = analyze_verilog(verilog_code)
    try:
        # Run analysis
        fea_matrix, adj_matrix, buf, instances = analyze_verilog(verilog_code)

        # Validate result
        if not fea_matrix or not adj_matrix:
            return JSONResponse(
                content={"status": "error", "message": "No valid gate-level structure detected."},
                status_code=400,
            )

        # Convert image buffer to base64 string for frontend
        image_base64 = None
        if buf:
            image_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        # Prepare response
        response_data = {
            "status": "success",
            "instances": [{"index": i, "name": inst} for i, inst in enumerate(instances)],
            "adjacency_matrix": adj_matrix,
            "feature_matrix": fea_matrix,
        }

        return JSONResponse(content=response_data)

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": f"Analysis failed: {str(e)}"},
            status_code=500,
        )





@router.post("/analyze_file")
async def analyze_verilog_file(file: UploadFile = File(...)):
    """
    Takes a Verilog (.v) file upload, reads its contents, and returns:
    - adjacency matrix
    - feature matrix
    - instance list (with index)
    - base64 graph image for frontend display
    """
    try:
        # --- Validate file type ---
        if not file.filename.endswith(".v"):
            return JSONResponse(
                content={"status": "error", "message": "Invalid file type. Please upload a .v Verilog file."},
                status_code=400,
            )

        # --- Read file content ---
        contents = await file.read()
        verilog_code = contents.decode("utf-8", errors="ignore")
        verilog_code = verilog_code.replace("\r", "").strip()

        # --- Run analysis ---
        fea_matrix, adj_matrix, buf, instances = analyze_verilog(verilog_code)

        # --- Validate result ---
        if not fea_matrix or not adj_matrix:
            return JSONResponse(
                content={"status": "error", "message": "No valid gate-level structure detected in uploaded file."},
                status_code=400,
            )

        # --- Convert image buffer to base64 string for frontend display ---
        image_base64 = None
        if buf:
            image_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        # --- Prepare response ---
        response_data = {
            "status": "success",
            "instances": [{"index": i, "name": inst} for i, inst in enumerate(instances)],
            "adjacency_matrix": adj_matrix,
            "feature_matrix": fea_matrix,
            "graph_image": image_base64,
        }

        return JSONResponse(content=response_data)

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": f"File analysis failed: {str(e)}"},
            status_code=500,
        )