import shutil
import time
import pandas as pd
from fastapi import FastAPI, APIRouter, UploadFile, File, Body, Form, status, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import HTTPException
import os
from utils import generate_tree, remove_files
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(
    title="ChatDT",
    description="The API for the ChatDT Application",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

app.mount('/uploads', StaticFiles(directory='uploads'),'uploads')

api = APIRouter(prefix='/api', tags=['API'])

#iris_20240128204554.csv
@api.post('/uploadfile')
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
    df.columns = map(str.lower, df.columns)
    df.columns = df.columns.str.strip()
    df.columns = df.columns.str.replace(' ', '_')
    df.columns = df.columns.str.replace('(', '_')
    df.columns = df.columns.str.replace(')', '')
    columns = list(df.columns)
    shuffle_new_filename = f"uploads/shuffle_{new_filename}"
    df.to_csv(shuffle_new_filename, index=False,columns=columns)

    endx = 50 if len(df) > 50 else len(df)
    table = df.iloc[0:endx].to_dict(orient="records")

    return {
        'file': new_filename,
        'filename': uploaded_file.filename,
        'columns': columns,
        'table':table
    }

@api.post('/demo')
def demo(demo_dataset: str = Form(...)):
    #demo_dataset = "demo_iris.csv"
    path = f"uploads/shuffle_{demo_dataset}"

    df = pd.read_csv(path)
    df = df.sample(frac=1).reset_index(drop=True)
    df.columns = map(str.lower, df.columns)
    df.columns = df.columns.str.strip()
    df.columns = df.columns.str.replace(' ', '_')
    df.columns = df.columns.str.replace('(', '_')
    df.columns = df.columns.str.replace(')', '')
    columns = list(df.columns)

    endx = 50 if len(df) > 50 else len(df)
    table = df.iloc[0:endx].to_dict(orient="records")

    return {
        'file': demo_dataset,
        'filename': demo_dataset,
        'columns': columns,
        'table':table
    }

"""
@api.get("/getdata")
async def get_data(filename: str = Form(...), page: int = Form(1, gt=0), per_page: int = Form(10, gt=0)):
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
"""

@api.post("/processdata")
async def process_data(filename: str = Form(...), rep_filename: str = Form(...), constraints: str = Form(...)):
    try:
        # Call the main function with provided parameters
        constraints = json.loads(constraints)
        result = generate_tree(filename, constraints, rep_filename)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing data: {str(e)}"
        )

    return result

@api.post("/removedata")
async def remove_data(filename: str = Form(...)):
    try:
        # Call the main function with provided parameters
        if("demo" in filename) :
            result = {'remove': 1}
        else:
            result = remove_files(filename)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing data: {str(e)}"
        )
    return result

app.include_router(api)