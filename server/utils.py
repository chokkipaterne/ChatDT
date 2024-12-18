import pandas as pd
from sklearn.utils import Bunch
from classification import DecisionTreeClassifier
from regression import DecisionTreeRegression
import math
import json
import random
import string
import os
import shutil
import re

def replace_np_types(input_string):
    """
    Replaces all occurrences of `np.float64(X)` and `np.int64(X)` in the input string
    with their plain numeric values (e.g., `3.14` and `42`).

    Parameters:
        input_string (str): The input string containing occurrences of `np.float64(X)` or `np.int64(X)`.

    Returns:
        str: The modified string with `np.float64(X)` and `np.int64(X)` replaced by their numeric values.
    """
    def replacer(match):
        # Extract the number inside
        return match.group(2)

    # Regex to match `np.float64(X)` or `np.int64(X)` where X is a number (integer or float)
    pattern = r"np\.(float64|int64)\(([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\)"

    # Substitute using the replacer function
    return re.sub(pattern, replacer, input_string)


def remove_files(filename):
    if os.path.exists("uploads/"+filename):
        os.remove("uploads/"+filename)
    if os.path.exists("uploads/shuffle_"+filename):
        os.remove("uploads/shuffle_"+filename)

    folder_path = "responses/"+filename.replace('.csv', '')
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
    return {'remove': 1}

def check_dt_type(dtype, len_target):
    if pd.api.types.is_categorical_dtype(dtype) or dtype=="object" or (pd.api.types.is_numeric_dtype(dtype) and len_target<=10):
        return 'classification'
    elif pd.api.types.is_numeric_dtype(dtype):
        return 'regression'
    return ''

def check_is_cat(dtype, len_target):
    if pd.api.types.is_categorical_dtype(dtype) or dtype=="object" or (pd.api.types.is_numeric_dtype(dtype) and len_target<=10):
        return True
    elif pd.api.types.is_numeric_dtype(dtype):
        return False
    return True

def generate_tree(filename, constraints={}, rep_filename=None):
    random_code = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(10)])
    response_filename = f"{filename.replace('.csv', '')}/{random_code}.json"

    train_size = 0.7
    accuracy = 0.0
    output_tree = {}
    if "train_size" in constraints:
        train_size = constraints["train_size"]
        
    #if "max_depth" not in constraints:
    #    constraints["max_depth"] = 40

    response = {"response_filename":response_filename, 
                "constraints":constraints, 
                "filename":filename, 
                "accuracy":"", 
                "string_tree":"", 
                "dict_tree": "",
                "output_tree":"",
                "dt_type": "",
                "unique_values": {},
                "unique_vals": []
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
    if target in features:
        features.remove(target)
    
    ftypes = []
    for f in features:
        df_f = df[f]
        dtype = df_f.dtype
        check_cat = check_is_cat(dtype, 10000)
        ftypes.append(check_cat)
        if check_cat:
            for v in df_f.unique().tolist():
                if f not in response["unique_values"]:
                    response["unique_values"][f] = []
                response["unique_values"][f].append(str(v))
                response["unique_vals"].append(f+'#'+str(v))

    #print(ftypes)
    #print(response["unique_values"])

    df_target = df[target]
    dtype = df_target.dtype
    target_names = df_target.unique()

    dt_type = check_dt_type(dtype, len(target_names))
    response["dt_type"] = dt_type

    if dt_type == 'classification':
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
        if rep_filename and rep_filename != 'no':
            rep_path = "responses/"+rep_filename
            isExist = os.path.exists(rep_path)
            if isExist:
                f = open(rep_path, "r")
                data = f.read()
                data = data.replace("None", '""')
                data = data.replace("False", '0')
                data = data.replace("True", '1')
                data = replace_np_types(data)
                data = json.loads(data)
                dict_tree = data["dict_tree"]
        
        # 2. Fit decision tree.
        #print(constraints)
        clf = DecisionTreeClassifier(constraints, features, dict_tree, ftypes)
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
    elif dt_type == 'regression':
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
        Y_test=data_test[:, -1]

        dataset = Bunch(
            data=data_train[:, :-1],
            target=data_train[:, -1],
            feature_names=features
        )

        X, y = dataset.data, dataset.target

        #load prev dataset
        dict_tree = {}
        if rep_filename and rep_filename != 'no':
            rep_path = "responses/"+rep_filename
            isExist = os.path.exists(rep_path)
            if isExist:
                f = open(rep_path, "r")
                data = f.read()
                data = data.replace("None", '""')
                data = data.replace("False", '0')
                data = data.replace("True", '1')
                data = replace_np_types(data)
                data = json.loads(data)
                dict_tree = data["dict_tree"]
        # 2. Fit decision tree.
        #print(constraints)
        clf = DecisionTreeRegression(constraints, features, dict_tree, ftypes)
        clf.fit(X, y)

        # 3. Predict.
        Y_pred = clf.predict(X_test)
        accuracy = clf.calculate_accuracy(Y_test, Y_pred)
        response["accuracy"] = accuracy
        
        # 4. Visualize.
        clf.print_tree(features)

        string_tree = clf.string_tree(features)
        response["string_tree"] = string_tree
        #print(string_tree)

        dict_tree = clf.generate_dict()
        #response["dict_tree"] = json.dumps(dict_tree, indent = 4)
        response["dict_tree"] = dict_tree

        output_tree = clf.generate_output_dict(features)
        response["output_tree"] = output_tree

    myrep = str(response).replace("'",'"')

    path = "responses/"+filename.replace('.csv', '')
    isExist = os.path.exists(path)
    if not isExist:
        os.makedirs(path)

    f = open("responses/"+response_filename, 'w')
    f.write(myrep)
    f.close()

    #print(float(format(accuracy, ".4f")) if dt_type=='classification' else float(format(accuracy, ".2f")))
    return_rep = {'response_filename':response_filename, 
                    'constraints':constraints, 
                    'filename':filename, 
                    'accuracy': float(format(accuracy, ".4f")) if dt_type=='classification' else float(format(accuracy, ".2f")), 
                    'output_tree':output_tree,
                    'dt_type':dt_type,
                    'unique_values': response["unique_values"],
                    'unique_vals': response["unique_vals"]}
    
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

constraints = {}
rep_filename = None
filename = "Breast_cancer_data_20240209152807.csv"
#filename = "demo_iris.csv"
rep = generate_tree(filename, constraints, rep_filename)

#constraints = {"max_depth":2}
constraints = {"nodes_constraints":{"2":{"yes":["sepal.length,1.7"]}}}
rep_filename = 'demo_iris/twfoI59jBN.json'
#filename = "Breast_cancer_data_20240211004318.csv"
filename = "demo_iris.csv"
rep = generate_tree(filename, constraints, rep_filename)

constraints = {"max_depth":3,"nodes_constraints":{"0":{"yes":["g2,10"]}}}
rep_filename = 'demo_student/fXqEKR6OXV.json'
filename = "demo_student.csv"
rep = generate_tree(filename, constraints, rep_filename)

constraints = {"max_depth":3,"nodes_constraints":{"9":{"yes":["g3"]}}}
rep_filename = 'demo_student/XPuKkSC7gY.json'
filename = "demo_student.csv"
rep = generate_tree(filename, constraints, rep_filename)
"""

