"""Implementation of the CART algorithm to train decision tree Regressions."""
import numpy as np
import math

from tree import NodeRegression
from sklearn.metrics import mean_squared_error

nb_nodes = 0
left_nodes = []
right_nodes = []

class DecisionTreeRegression:
    def __init__(self, constraints={}, features={}, dict_tree={}):
        self.constraints = constraints
        self.features = features
        self.dict_tree = dict_tree
        self.min_num_samples = float("inf")
        self.max_num_samples = -float("inf")
        self.min_var_red = float("inf")
        self.max_var_red = -float("inf")
    
    def fit(self, X, y):
        global nb_nodes, left_nodes, right_nodes
        """Build decision tree Regression."""
        self.n_features_ = X.shape[1]
        nb_nodes = 0
        left_nodes = []
        right_nodes = []
        if bool(self.dict_tree):
            tree_init = self._load_tree(self.dict_tree)
            self.tree_ = self._update_tree(X,y, tree_init, 0)
        else:
            self.tree_ = self._grow_tree(X, y, 0)

    def predict(self, X):
        """Predict class for X."""
        return [self._predict(inputs) for inputs in X]
    
    def variance_reduction(self, parent, l_child, r_child):
        ''' function to compute variance reduction '''
        weight_l = len(l_child) / len(parent)
        weight_r = len(r_child) / len(parent)
        reduction = np.var(parent) - (weight_l * np.var(l_child) + weight_r * np.var(r_child))
        return reduction
    
    def calculate_leaf_value(self, Y):
        ''' function to compute leaf node '''
        val = np.mean(Y)
        return val

    def _load_tree(self, dict_tree={}):
        """Build a decision tree by recursively finding the best split."""
        # Population for each class in current node. The predicted class is the one with
        # largest population.
        if not bool(dict_tree) or dict_tree is None:
            return None
        
        node = NodeRegression(
            num_samples= dict_tree["num_samples"],
            value= dict_tree["value"],
        )

        idx = dict_tree["feature_index"]
        thr = dict_tree["threshold"]

        if idx is not None:
            node.var_red = dict_tree["var_red"]
            node.feature_index = idx
            node.threshold = thr
            node.ref_init = dict_tree["ref"]
            node.left = self._load_tree(dict_tree["left"] if ("left" in dict_tree and dict_tree["left"] and dict_tree["left"] != "") else None)
            node.right = self._load_tree(dict_tree["right"] if ("right" in dict_tree and dict_tree["right"] and dict_tree["right"] != "") else None)
        return node

    def _update_tree(self, X, y, node=None, depth=0, is_left=False):
        """Build a decision tree by recursively finding the best split."""
        # Population for each class in current node. The predicted class is the one with
        # largest population.
        global nb_nodes

        nodes_constraints = {}
        if "nodes_constraints" in self.constraints and str(node.ref_init) in self.constraints["nodes_constraints"]:
            nodes_constraints = self.constraints["nodes_constraints"][str(node.ref_init)]
        
        no_features_index = []
        yes_features_index = []
        idx = None
        thr = None
        var_red = None
        remove = False
        change = True
       
        if bool(nodes_constraints):
            if "remove" in nodes_constraints:
                remove = True
                node = None
            else:
                if "no" in nodes_constraints:
                    for value in nodes_constraints["no"]:
                        feature_num = self.features.index(value.strip())
                        no_features_index.append(feature_num)
                        if value.strip().lower() == self.features[node.feature_index].strip().lower():
                            node = None
                if "yes" in nodes_constraints:
                    for value in nodes_constraints["yes"]:
                        rep = value.split(",")
                        feature_name = rep[0]
                        feature_num = self.features.index(feature_name)
                        yes_features_index.append(feature_num)
                        if len(rep) == 2:
                            idx = feature_num
                            thr = float(rep[1])
        
        good_feature_index = yes_features_index.copy()
        if len(yes_features_index) == 0:
            for index in range(self.n_features_):
                if not (index in no_features_index) and not (index in yes_features_index):
                    good_feature_index.append(index)
        
        # Split recursively until maximum depth is reached.
        constraints_respected = True
        if constraints_respected and "max_depth" in self.constraints:
            if depth >= self.constraints["max_depth"]:
                constraints_respected = False
        if constraints_respected and "min_samples_split" in self.constraints:
            if y.size < self.constraints["min_samples_split"]:
                constraints_respected = False
        
        if (node is not None and node.feature_index in good_feature_index and node.left is None) :
            change = False
        elif (node is not None and node.feature_index in good_feature_index and not constraints_respected):
            node.left = None
            node.right = None
            node.feature_index = 0
            node.threshold = 0
        elif (node is not None and node.feature_index in good_feature_index and idx is None and thr is None):
            idx = node.feature_index
            thr = node.threshold
        else:
            node = NodeRegression(
                num_samples=y.size,
                value=value,
            ) 

        if constraints_respected and not remove and change:
            if idx is None and thr is None:
                idx, thr, var_red = self._best_split(X, y, good_feature_index)
            if idx is not None:
                indices_left = X[:, idx] < thr
                X_left, y_left = X[indices_left], y[indices_left]
                X_right, y_right = X[~indices_left], y[~indices_left]
                if var_red is None:
                    var_red = self.variance_reduction(y, y_left, y_right)
                node.feature_index = idx
                node.threshold = thr
                node.var_red = var_red
                node.ref = nb_nodes
                nb_nodes += 1
                if node.feature_index and depth > 0:
                    if is_left:
                        left_nodes.append(node.feature_index)
                    else:
                        right_nodes.append(node.feature_index)
                if node.left is not None:
                    node.left = self._update_tree(X_left, y_left, node.left, depth + 1,True)
                else:
                    node.left = self._grow_tree(X_left, y_left, depth + 1, True)
                if node.right is not None:
                    node.right = self._update_tree(X_right, y_right, node.right, depth + 1, False)
                else:
                    node.right = self._grow_tree(X_right, y_right, depth + 1, False)
        
        if node.num_samples > self.max_num_samples:
            self.max_num_samples = node.num_samples
        if node.num_samples < self.min_num_samples:
            self.min_num_samples = node.num_samples
        if node.var_red > self.max_var_red:
            self.max_var_red = node.var_red
        if node.num_samples < self.min_var_red:
            self.min_var_red = node.var_red
        return node
    
    def _grow_tree(self, X, y, depth=0, is_left=False):
        """Build a decision tree by recursively finding the best split."""
        # Population for each class in current node. The predicted class is the one with
        # largest population.
        global nb_nodes
        
        leaf_value = self.calculate_leaf_value(y)
        node = NodeRegression(
            num_samples=y.size,
            value=leaf_value,
        )

        # Split recursively until maximum depth is reached.
        constraints_respected = True
        if constraints_respected and "max_depth" in self.constraints:
            if depth >= self.constraints["max_depth"]:
                constraints_respected = False
        if constraints_respected and "min_samples_split" in self.constraints:
            if y.size < self.constraints["min_samples_split"]:
                constraints_respected = False

        if constraints_respected:
            idx, thr, var_red = self._best_split(X, y)
            if idx is not None and var_red > 0:
                indices_left = X[:, idx] < thr
                X_left, y_left = X[indices_left], y[indices_left]
                X_right, y_right = X[~indices_left], y[~indices_left]
                node.feature_index = idx
                node.threshold = thr
                node.var_red = var_red
                node.ref = nb_nodes
                nb_nodes += 1
                if node.feature_index and depth > 0:
                    if is_left:
                        left_nodes.append(node.feature_index)
                    else:
                        right_nodes.append(node.feature_index)
                node.left = self._grow_tree(X_left, y_left, depth + 1,  True)
                node.right = self._grow_tree(X_right, y_right, depth + 1, False)

        if node.num_samples > self.max_num_samples:
            self.max_num_samples = node.num_samples
        if node.num_samples < self.min_num_samples:
            self.min_num_samples = node.num_samples
        if node.var_red > self.max_var_red:
            self.max_var_red = node.var_red
        if node.num_samples < self.min_var_red:
            self.min_var_red = node.var_red

        return node
    
    def _best_split(self, X, y, good_feature_index=[]):
        ''' function to find the best split '''
        # dictionary to store the best split
        best_idx, best_thr, best_var_red = None, None, -float("inf")
        max_var_red = -float("inf")
        # Loop through all features.
        if len(good_feature_index)==0: 
            good_feature_index = range(self.n_features_)
        
        for feature_index in good_feature_index:
            feature_values = X[:, feature_index]
            possible_thresholds = np.unique(feature_values)
            # loop over all the feature values present in the data
            for threshold in possible_thresholds:
                # get current split
                indices_left = X[:, feature_index] < threshold
                X_left, y_left = X[indices_left], y[indices_left]
                X_right, y_right = X[~indices_left], y[~indices_left]

                # check if childs are not null
                if len(X_left)>0 and len(X_right)>0:
                    # compute information gain
                    curr_var_red = self.variance_reduction(y, y_left, y_right)
                    # update the best split if needed
                    if curr_var_red>max_var_red:
                        best_idx = feature_index
                        best_thr = threshold
                        best_var_red = curr_var_red
                        max_var_red = curr_var_red          
        # return best split
        return best_idx, best_thr, best_var_red

    def _predict(self, inputs):
        """Predict class for a single sample."""
        node = self.tree_
        while node.left:
            if inputs[node.feature_index] < node.threshold:
                node = node.left
            else:
                node = node.right
        return node.value
    
    def calculate_accuracy(self, Y_test, Y_pred):
        return math.ceil(np.sqrt(mean_squared_error(Y_test, Y_pred))*100)/100 
    
    def generate_dict(self, node=None):
        if not node:
            node = self.tree_
        
        try:
            dict = node.__dict__
        except Exception as e:
            dict = dict

        if dict['left']:
            dict['left'] = self.generate_dict(dict['left'])
            dict['right'] = self.generate_dict(dict['right'])
        return dict
        
    def map_value_to_color(self, value, min_value, max_value):
        # Define the color range (light to strong)
        light_color = (232, 244, 248)  # Light blue
        strong_color = (0, 0, 255)      # Strong color (blue)

        # Normalize the value to the range [0, 1]
        normalized_value = (value - min_value) / (max_value - min_value)
        normalized_value = abs(normalized_value)

        # Linearly interpolate between light and strong colors
        r = int(light_color[0] + (strong_color[0] - light_color[0]) * normalized_value)
        g = int(light_color[1] + (strong_color[1] - light_color[1]) * normalized_value)
        b = int(light_color[2] + (strong_color[2] - light_color[2]) * normalized_value)

        # Convert RGB color to hexadecimal format
        hex_color = "#{:02x}{:02x}{:02x}".format(r, g, b)
        return hex_color

    def generate_output_dict(self, feature_names, node=None):
        leaf_type = 1
        if not node:
            leaf_type = 0
            dict = self.tree_
        else:
            dict = node
        
        try:
            dict = dict.__dict__
        except Exception as e:
            dict = dict

        output = {}
        if dict['left']:
            threshold = str(format(dict['threshold'], ".2f"))
            #threshold = str(dict['threshold'])
            output['name'] = feature_names[dict['feature_index']] + "<" + threshold
            var_red = float(format(dict['var_red'] if dict['var_red'] else 0, ".2f"))
            #var_red = dict['var_red']
            output['attributes'] = {
                'leaf_type':leaf_type,
                'node': dict['ref'],
                'num_samples': dict['num_samples'],
                'var_red': var_red,
                'color_var_red': self.map_value_to_color(dict['var_red'],self.min_var_red,self.max_var_red),
                'color_num_samples': self.map_value_to_color(dict['num_samples'],self.min_num_samples,self.max_num_samples),
            }
            output['children'] = [self.generate_output_dict(feature_names, dict['left']), self.generate_output_dict(feature_names, dict['right'])]
        else:
            leaf_type = 2
            output['name'] = float(format(dict['value'] or 0, ".2f"))
            var_red = float(format(dict['var_red'] or 0, ".2f"))
            output['attributes'] = {
                'leaf_type':leaf_type,
                'node': dict['ref'],
                'num_samples': dict['num_samples'],
                'var_red': var_red,
                'color_var_red': self.map_value_to_color(dict['var_red'],self.min_var_red,self.max_var_red),
                'color_num_samples': self.map_value_to_color(dict['num_samples'],self.min_num_samples,self.max_num_samples),
            }
        return output
    
    def print_tree(self, feature_names, tree=None, indent=" "):
        ''' function to print the tree '''
        #needed_keys = ['left', 'right', 'threshold']
        if not tree:
            tree = self.tree_
        
        try:
            dict = tree.__dict__
        except Exception as e:
            dict = tree

            #dict = {k:dict[k] for k in needed_keys}
        if not dict['right']:
            print(dict['value'])
        else:
            print(feature_names[dict['feature_index']]+ "<"+ str(float(dict['threshold']))+ "?"+ str(float(dict['var_red'])))
            print("%sleft:" % (indent), end="")
            self.print_tree(feature_names, dict['left'], indent + " ")
            print("%sright:" % (indent), end="")
            self.print_tree(feature_names, dict['right'], indent + " ")

    def string_tree(self, feature_names, tree=None, indent=" "):
        ''' function to print the tree '''
        if not tree:
            tree = self.tree_
         
        try:
            dict = tree.__dict__
        except Exception as e:
            dict = tree

        if not dict['right']:
            return str(dict['value']) + "\n"
        else:
            return feature_names[dict['feature_index']]+ "<"+ str(float(dict['threshold']))+ "?"+ str(float(dict['var_red']))+ "\n" \
            + str("%sleft:" % (indent)) \
            + self.string_tree(feature_names, dict['left'], indent + " ") \
            + str("%sright:" % (indent)) \
            + self.string_tree(feature_names, dict['right'], indent + " ")
    
        
