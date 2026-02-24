# RTL Timing Violation Prediction using ML

This project is a full-stack application designed to analyze Verilog RTL code and predict potential timing violations using Machine Learning. It features a React-based frontend for code submission and visualization, and a FastAPI-based backend that performs RTL graph analysis and runs predictions using a pre-trained Decision Tree model.

## 🚀 Features

- **RTL Analysis**: Parses Verilog gate-level code to extract adjacency and feature matrices.
- **Graph Visualization**: Generates and displays a visual graph of the RTL structure.
- **Timing Prediction**: Predicts timing violations based on circuit structure and user-defined clock parameters (period, uncertainty, setup/hold times).
- **Interactive UI**: User-friendly interface for uploading `.v` files or pasting code directly.
- **Model-Driven**: Uses a Decision Tree classifier trained on timing data.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: FastAPI, Python, PyVerilog, NetworkX, Matplotlib, Joblib.
- **Machine Learning**: Scikit-learn (Decision Tree Classifier).

## 📂 Project Structure

```text
rtl_prediction_by_ml/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Layout and Main Pages
│   │   └── App.tsx         # Main Component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # App Entry Point
│   │   ├── routes.py       # API Endpoints
│   │   ├── matrices.py     # RTL Parsing Logic
│   │   └── schemas.py      # Pydantic Models
│   ├── decision_tree_model.pkl # Trained ML Model
│   └── requirements.txt
└── README.md
```

## ⚙️ Setup Instructions

### Backend (FastAPI)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows: myenv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend (React)

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints

- `POST /analyze`: Analyzes Verilog code string and returns graph data.
- `POST /analyze_file`: Analyzes an uploaded `.v` file.
- `POST /predict`: Predicts timing violation based on extracted features and clock parameters.
- `GET /`: Health check.

## 📝 Usage

1. Paste your gate-level Verilog code into the editor or upload a `.v` file.
2. Click **Analyze** to generate the circuit graph and feature matrices.
3. Configure the **Clock Parameters** (Period, Uncertainty, etc.).
4. Click **Predict** to see if the design is likely to have a timing violation.

---
*Created for RTL Timing Prediction Research.*
