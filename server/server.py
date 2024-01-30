import shutil
import time
import pandas as pd
from fastapi import FastAPI, UploadFile, File, status, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import HTTPException
import os
from utils import generate_tree

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

app.mount('/uploads', StaticFiles(directory='uploads'),'uploads')

#iris_20240128204554.csv
@app.post('/upload')
def upload_file(uploaded_file: UploadFile = File(...)):
    if uploaded_file.content_type != 'text/csv':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wow, That's not allowed")
    
    time_str = time.strftime('%Y%m%d%H%M%S')
    new_filename =  "{}_{}.csv".format(os.path.splitext(uploaded_file.filename)[0], time_str)
    path = f"uploads/{new_filename}"
    
    with open(path, 'w+b') as file:
        shutil.copyfileobj(uploaded_file.file, file)

    df = pd.read_csv(path)
    df = df.sample(frac=1).reset_index(drop=True)
    shuffle_new_filename = f"uploads/shuffle_{new_filename}"
    df.to_csv(shuffle_new_filename, index=False)

    return {
        'file': new_filename,
        'path': path,
    }

@app.get("/data")
async def get_data(filename: str, page: int = Query(1, gt=0), per_page: int = Query(10, gt=0)):
    try:
        # Read the CSV file into a Pandas DataFrame
        filename = f"uploads/shuffle_{filename}"
        df = pd.read_csv(filename)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, detail="File not found"
        )
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page

    # Check if the requested page is valid
    if start_idx >= len(df):
        raise HTTPException(
            status_code=400, detail="Page out of bounds"
        )

    # Slice the DataFrame based on pagination parameters
    paginated_data = df.iloc[start_idx:end_idx].to_dict(orient="records")

    return paginated_data

@app.post("/process_data")
async def process_data(filename: str, train_size: float = 0.7, constraints: dict = {}):
    try:
        # Call the main function with provided parameters
        result = generate_tree(filename, train_size, constraints)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing data: {str(e)}"
        )

    return result