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

def generate_tree(filename, train_size=0.7, constraints={}):
    random_code = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(10)])
    response_filename = f"responses/{random_code}_{filename}"
    response_filename = response_filename.replace(".csv", ".json")

    response = {"response_filename":response_filename, "constraints":constraints, "filename":filename, "train_size":train_size, "accuracy":"", "string_tree":"", "dict_tree": ""}
    
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

    # 2. Fit decision tree.
    clf = DecisionTreeClassifier(constraints)
    clf.fit(X, y)

    # 3. Predict.
    Y_pred = clf.predict(X_test)
    accuracy = clf.calculate_accuracy(Y_test, Y_pred)
    response["accuracy"] = accuracy
    
    # 4. Visualize.
    string_tree = clf.string_tree(features, target_names)
    response["string_tree"] = string_tree

    dict_tree = clf.generate_dict()
    #response["dict_tree"] = json.dumps(dict_tree, indent = 4)
    response["dict_tree"] = dict_tree

    #myrep = json.dumps(response, indent = 4)

    f = open(response_filename, 'w')
    f.write(str(response))
    f.close()

    return response

rep = generate_tree("iris_20240128204554.csv")
print(rep)