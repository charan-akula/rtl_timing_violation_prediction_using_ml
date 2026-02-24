# RTL Timing Violation Prediction using ML

## 📌 Project Overview
Timing violations are a major challenge in digital circuit design because they can cause functional errors, unstable outputs, and expensive chip re-spins. Traditional Electronic Design Automation (EDA) tools typically detect these issues late in the design cycle (such as during synthesis or static timing analysis), limiting opportunities for early optimization.

This project introduces a **Machine Learning–based framework** that predicts timing violations directly from **Register Transfer Level (RTL)** designs before synthesis. By analyzing structural characteristics of circuits early, engineers can identify risky designs and optimize them sooner.

The system automatically extracts structural features from Verilog RTL using **PyVerilog**, then feeds them into a trained **Decision Tree classifier** that predicts whether a circuit is likely to violate timing constraints. The model currently achieves approximately **80% prediction accuracy**.

## 🚀 Features

- **RTL Analysis**: Parses Verilog gate-level code to extract adjacency and feature matrices.
- **Graph Visualization**: Generates and displays a visual graph of the RTL structure.
- **Timing Violation Prediction**: Predicts timing violations based on circuit structure and user-defined clock parameters (period, uncertainty, setup/hold times).
- **Interactive UI**: User-friendly interface for uploading `.v` files or pasting code directly.
- **Model-Driven**: Uses a Decision Tree classifier trained on timing data.
---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: FastAPI, Python, PyVerilog, NetworkX, Matplotlib, Joblib.
- **Machine Learning**: Scikit-learn (Decision Tree Classifier).


## ⚙️ Setup Instructions

### Backend (FastAPI)

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   
2. Create and activate a virtual environment:
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows: myenv\Scripts\activate
   ```

3. Navigate to the server directory:
   ```bash
   cd server
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
