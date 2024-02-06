import pandas as pd
import numpy as np
from sklearn.tree import export_graphviz
from sklearn.utils import Bunch
from cart import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
import math
import json
import random
import string
import os
import shutil

def remove_files(filename):
    if os.path.exists("uploads/"+filename):
        os.remove("uploads/"+filename)
    if os.path.exists("uploads/shuffle_"+filename):
        os.remove("uploads/shuffle_"+filename)

    folder_path = "responses/"+filename.replace('.csv', '')
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
    return {'remove': 1}

def generate_tree(filename, constraints={}, rep_filename=None):
    random_code = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(10)])
    response_filename = f"{filename.replace('.csv', '')}/{random_code}.json"

    train_size = 0.7
    if "train_size" in constraints:
        train_size = constraints["train_size"]

    response = {"response_filename":response_filename, 
                "constraints":constraints, 
                "filename":filename, 
                "accuracy":"", 
                "string_tree":"", 
                "dict_tree": "",
                "output_tree":""
                }
    
    # 1. Load dataset.
    shuffle_filename = f"uploads/shuffle_{filename}"
    df = pd.read_csv(shuffle_filename)
    columns = list(df.columns)

    features = columns[:-1]
    target = columns[-1]

    if "features" in constraints:
        features = constraints["features"]
    if "target" in constraints:
        target = constraints["target"]
        
    df_target = df[target]
    target_names = df_target.unique()
    target_nums = [int(i) for i in range(0, len(target_names))]

    df[target].replace(target_names, target_nums, inplace=True)
    all_features = features.copy()
    all_features.append(target)

    #pre-processing
    df = df.dropna()
    
    data = df[all_features].values
    len_data = len(data)
    len_train = math.floor(len_data*train_size)
    data_train = data[:len_train]
    data_test = data[len_train:]
    
    X_test=data_test[:, :-1]
    Y_test=data_test[:, -1].astype('int')

    dataset = Bunch(
        data=data_train[:, :-1],
        target=data_train[:, -1].astype('int'),
        feature_names=features,
        target_names=target_names,
    )

    X, y = dataset.data, dataset.target

    #load prev dataset
    dict_tree = {}
    if rep_filename:
        rep_path = "responses/"+rep_filename
        isExist = os.path.exists(rep_path)
        if isExist:
            f = open(rep_path, "r")
            data = f.read()
            data = data.replace("None", '""')
            data = json.loads(data)
            dict_tree = data["dict_tree"]
    # 2. Fit decision tree.
    clf = DecisionTreeClassifier(constraints, features, dict_tree)
    clf.fit(X, y)

    # 3. Predict.
    Y_pred = clf.predict(X_test)
    accuracy = clf.calculate_accuracy(Y_test, Y_pred)
    response["accuracy"] = accuracy
    
    # 4. Visualize.
    clf.print_tree(features, target_names)

    string_tree = clf.string_tree(features, target_names)
    response["string_tree"] = string_tree
    #print(string_tree)

    dict_tree = clf.generate_dict()
    #response["dict_tree"] = json.dumps(dict_tree, indent = 4)
    response["dict_tree"] = dict_tree

    output_tree = clf.generate_output_dict(features, target_names)
    response["output_tree"] = output_tree

    myrep = str(response).replace("'",'"')

    path = "responses/"+filename.replace('.csv', '')
    isExist = os.path.exists(path)
    if not isExist:
        os.makedirs(path)

    f = open("responses/"+response_filename, 'w')
    f.write(myrep)
    f.close()

    return_rep = {'response_filename':response_filename, 
                    'constraints':constraints, 
                    'filename':filename, 
                    'accuracy':float(format(accuracy, ".2f")), 
                    'output_tree':output_tree}

    return return_rep

#rep = generate_tree("iris_20240128204554.csv")
#rep = load_tree("iris_20240204141257.csv", "FT9H95jQil.json", {})
#"max_depth":2,"min_samples_split":100, 
"""constraints = {"nodes_constraints":{
    0: {"yes": ["sepal.length", "petal.width"], "no":["petal.length"]}
}}"""
"""constraints = {"nodes_constraints":{
    1: {"remove":"y"}
}}"""
"""constraints = {"nodes_constraints":{
    0: {"no": ["sepal.length", "petal.length"]}
}}
rep_filename = "iris_20240204141257/nVhPye9AdA.json"
rep = generate_tree("iris_20240204141257.csv", constraints, rep_filename)
"""