"""Implementation of the CART algorithm to train decision tree classifiers."""
import numpy as np
import math

from tree import Node
from sklearn.metrics import accuracy_score

nb_nodes = 0
left_nodes = []
right_nodes = []

class DecisionTreeClassifier:
    def __init__(self, constraints={}, features={}, dict_tree={}):
        self.constraints = constraints
        self.features = features
        self.dict_tree = dict_tree
        self.min_num_samples = float("inf")
        self.max_num_samples = -float("inf")
        self.min_gini = float("inf")
        self.max_gini = -float("inf")
    
    def fit(self, X, y):
        global nb_nodes, left_nodes, right_nodes
        """Build decision tree classifier."""
        self.n_classes_ = len(set(y))  # classes are assumed to go from 0 to n-1

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

    def debug(self, feature_names, class_names, show_details=True):
        """Print ASCII visualization of decision tree."""
        self.tree_.debug(feature_names, class_names, show_details)

    def _gini(self, y):
        """Compute Gini impurity of a non-empty node.

        Gini impurity is defined as Σ p(1-p) over all classes, with p the frequency of a
        class within the node. Since Σ p = 1, this is equivalent to 1 - Σ p^2.
        """
        m = y.size
        return 1.0 - sum((np.sum(y == c) / m) ** 2 for c in range(self.n_classes_))

    def _best_split(self, X, y, good_feature_index=[]):
        """Find the best split for a node.

        "Best" means that the average impurity of the two children, weighted by their
        population, is the smallest possible. Additionally it must be less than the
        impurity of the current node.

        To find the best split, we loop through all the features, and consider all the
        midpoints between adjacent training samples as possible thresholds. We compute
        the Gini impurity of the split generated by that particular feature/threshold
        pair, and return the pair with smallest impurity.

        Returns:
            best_idx: Index of the feature for best split, or None if no split is found.
            best_thr: Threshold to use for the split, or None if no split is found.
        """
        # Need at least two elements to split a node.
        m = y.size
        if m <= 1:
            return None, None

        # Count of each class in the current node.
        num_parent = [np.sum(y == c) for c in range(self.n_classes_)]

        # Gini of current node.
        best_gini = 1.0 - sum((n / m) ** 2 for n in num_parent)
        best_idx, best_thr = None, None

        # Loop through all features.
        if len(good_feature_index)==0: 
            good_feature_index = range(self.n_features_)

        for idx in good_feature_index:
            # Sort data along selected feature.
            thresholds, classes = zip(*sorted(zip(X[:, idx], y)))

            # We could actually split the node according to each feature/threshold pair
            # and count the resulting population for each class in the children, but
            # instead we compute them in an iterative fashion, making this for loop
            # linear rather than quadratic.
            num_left = [0] * self.n_classes_
            num_right = num_parent.copy()
            for i in range(1, m):  # possible split positions
                c = classes[i - 1]
                num_left[c] += 1
                num_right[c] -= 1
                gini_left = 1.0 - sum(
                    (num_left[x] / i) ** 2 for x in range(self.n_classes_)
                )
                gini_right = 1.0 - sum(
                    (num_right[x] / (m - i)) ** 2 for x in range(self.n_classes_)
                )

                # The Gini impurity of a split is the weighted average of the Gini
                # impurity of the children.
                gini = (i * gini_left + (m - i) * gini_right) / m

                # The following condition is to make sure we don't try to split two
                # points with identical values for that feature, as it is impossible
                # (both have to end up on the same side of a split).
                if thresholds[i] == thresholds[i - 1]:
                    continue

                if gini < best_gini:
                    best_gini = gini
                    best_idx = idx
                    best_thr = (thresholds[i] + thresholds[i - 1]) / 2  # midpoint
                    #best_thr = math.floor(best_thr*100)/100

        return best_idx, best_thr

    def _load_tree(self, dict_tree={}):
        """Build a decision tree by recursively finding the best split."""
        # Population for each class in current node. The predicted class is the one with
        # largest population.
        if not bool(dict_tree) or dict_tree is None:
            return None
        
        node = Node(
            gini= dict_tree["gini"],
            num_samples= dict_tree["num_samples"],
            num_samples_per_class= dict_tree["num_samples_per_class"],
            predicted_class= dict_tree["predicted_class"],
        )

        idx = dict_tree["feature_index"]
        thr = dict_tree["threshold"]
        if idx is not None:
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
        num_samples_per_class = [np.sum(y == i) for i in range(self.n_classes_)]
        predicted_class = np.argmax(num_samples_per_class)

        nodes_constraints = {}
        if "nodes_constraints" in self.constraints and str(node.ref_init) in self.constraints["nodes_constraints"]:
            nodes_constraints = self.constraints["nodes_constraints"][str(node.ref_init)]
        
        no_features_index = []
        yes_features_index = []
        idx = None
        thr = None
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
            node = Node(
                gini=self._gini(y),
                num_samples=y.size,
                num_samples_per_class=num_samples_per_class,
                predicted_class=predicted_class,
            ) 

        if constraints_respected and not remove and change:
            if idx is None and thr is None:
                idx, thr = self._best_split(X, y, good_feature_index)
            if idx is not None:
                indices_left = X[:, idx] < thr
                X_left, y_left = X[indices_left], y[indices_left]
                X_right, y_right = X[~indices_left], y[~indices_left]
                node.feature_index = idx
                node.threshold = thr
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
        if node.gini > self.max_gini:
            self.max_gini = node.gini
        if node.num_samples < self.min_gini:
            self.min_gini = node.gini
        return node
    
    def _grow_tree(self, X, y, depth=0, is_left=False):
        """Build a decision tree by recursively finding the best split."""
        # Population for each class in current node. The predicted class is the one with
        # largest population.
        global nb_nodes
        num_samples_per_class = [np.sum(y == i) for i in range(self.n_classes_)]
        predicted_class = np.argmax(num_samples_per_class)

        node = Node(
            gini=self._gini(y),
            num_samples=y.size,
            num_samples_per_class=num_samples_per_class,
            predicted_class=predicted_class,
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
            idx, thr = self._best_split(X, y)
            if idx is not None:
                indices_left = X[:, idx] < thr
                X_left, y_left = X[indices_left], y[indices_left]
                X_right, y_right = X[~indices_left], y[~indices_left]
                node.feature_index = idx
                node.threshold = thr
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
        if node.gini > self.max_gini:
            self.max_gini = node.gini
        if node.num_samples < self.min_gini:
            self.min_gini = node.gini

        return node

    def _predict(self, inputs):
        """Predict class for a single sample."""
        node = self.tree_
        while node.left:
            if inputs[node.feature_index] < node.threshold:
                node = node.left
            else:
                node = node.right
        return node.predicted_class
    
    def calculate_accuracy(self, Y_test, Y_pred):
        return math.ceil(accuracy_score(Y_test, Y_pred)*10000)/10000 
    
    def generate_dict(self, node=None):
        if not node:
            node = self.tree_
        try:
            dict = node.__dict__
        except Exception as e:
            dict = node

        #dict = node.__dict__
        if dict['left']:
            dict['left'] = self.generate_dict(dict['left'])
            dict['right'] = self.generate_dict(dict['right'])
        return dict

    
    def map_value_to_color(self, value, min_value, max_value):
        print(value,min_value,max_value)
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

    def generate_output_dict(self, feature_names, class_names, node=None):
        leaf_type = 1
        if not node:
            leaf_type = 0
            mydict = self.tree_
        else:
            mydict = node
        
        try:
            mydict = mydict.__dict__
        except Exception as e:
            mydict = mydict
        
        output = {}
        if mydict['left']:
            threshold = str(format(mydict['threshold'], ".2f"))
            #threshold = str(mydict['threshold'])
            output['name'] = feature_names[mydict['feature_index']] + "<" + threshold
            gini = float(format(mydict['gini'], ".2f"))
            #gini = mydict['gini']
            output['attributes'] = {
                'leaf_type': leaf_type,
                'node': mydict['ref'],
                'num_samples': mydict['num_samples'],
                'gini': gini,
                'color_gini': self.map_value_to_color(mydict['gini'],self.min_gini,self.max_gini),
                'color_num_samples': self.map_value_to_color(mydict['num_samples'],self.min_num_samples,self.max_num_samples),
            }
            output['children'] = [self.generate_output_dict(feature_names, class_names, mydict['left']), self.generate_output_dict(feature_names, class_names, mydict['right'])]
        else:
            leaf_type = 2
            output['name'] = class_names[mydict['predicted_class']]
            if(not isinstance(output['name'],str)):
                output['name'] = int(class_names[mydict['predicted_class']])

            gini = float(format(mydict['gini'] or 0, ".2f"))
            output['attributes'] = {
                'leaf_type': leaf_type,
                'node': mydict['ref'],
                'num_samples': mydict['num_samples'],
                'gini': gini,
                'color_gini': self.map_value_to_color(mydict['gini'],self.min_gini,self.max_gini),
                'color_num_samples': self.map_value_to_color(mydict['num_samples'],self.min_num_samples,self.max_num_samples),
            }
            
        return output
    
    def print_tree(self, feature_names, class_names, tree=None, indent=" "):
        ''' function to print the tree '''
        #needed_keys = ['left', 'right', 'threshold']
        if not tree:
            tree = self.tree_
        
        try:
            dict = tree.__dict__
        except Exception as e:
            dict = tree
            
        if not dict['right']:
            print(class_names[dict['predicted_class']])
        else:
            print(feature_names[dict['feature_index']]+ "<"+ str(float(dict['threshold']))+ "?"+ str(float(dict['gini'])))
            print("%sleft:" % (indent), end="")
            self.print_tree(feature_names, class_names, dict['left'], indent + " ")
            print("%sright:" % (indent), end="")
            self.print_tree(feature_names, class_names, dict['right'], indent + " ")

    def string_tree(self, feature_names, class_names, tree=None, indent=" "):
        ''' function to print the tree '''
        if not tree:
            tree = self.tree_
        if type(tree) is Node:
            dict = tree.__dict__
        if not dict['right']:
            return str(class_names[dict['predicted_class']]) + "\n"
        else:
            return feature_names[dict['feature_index']]+ "<"+ str(float(dict['threshold']))+ "?"+ str(float(dict['gini']))+ "\n" \
            + str("%sleft:" % (indent)) \
            + self.string_tree(feature_names, class_names, dict['left'], indent + " ") \
            + str("%sright:" % (indent)) \
            + self.string_tree(feature_names, class_names, dict['right'], indent + " ")
    