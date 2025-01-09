from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle
import json
from typing import Dict, Any
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1Score: float

model = None
current_dataset = None

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_dataset
    contents = await file.read()
    
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    current_dataset = df
    
    stats = {
        "rows": len(df),
        "columns": len(df.columns),
        "missingValues": df.isna().sum().sum(),
        "preview": df.head(5).to_dict('records')
    }
    
    return stats

@app.post("/train")
async def train_model():
    global model, current_dataset
    
    if current_dataset is None:
        return {"error": "No dataset uploaded"}
    
    # Assuming last column is target variable
    X = current_dataset.iloc[:, :-1]
    y = current_dataset.iloc[:, -1]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    model = RandomForestClassifier()
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    
    # Calculate metrics
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    metrics = {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision": float(precision_score(y_test, predictions, average='weighted')),
        "recall": float(recall_score(y_test, predictions, average='weighted')),
        "f1Score": float(f1_score(y_test, predictions, average='weighted'))
    }
    
    return metrics

@app.get("/download")
async def download_model():
    if model is None:
        return {"error": "No trained model available"}
    
    # Save model to memory
    model_bytes = pickle.dumps(model)
    return model_bytes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
