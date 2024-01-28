"""Implementation of the CART algorithm to train decision tree classifiers."""
import numpy as np

import tree
from sklearn.metrics import accuracy_score 


class DecisionTreeClassifier:
    def __init__(self, constraints={}):
        self.constraints = constraints
        

    def fit(self, X, y):
        """Build decision tree classifier."""
        self.n_classes_ = len(set(y))  # classes are assumed to go from 0 to n-1
        self.n_features_ = X.shape[1]
        self.nb_nodes = 0
        self.tree_ = self._grow_tree(X, y)

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

    def _best_split(self, X, y):
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
        for idx in range(self.n_features_):
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

        return best_idx, best_thr

    def _grow_tree(self, X, y, depth=0):
        """Build a decision tree by recursively finding the best split."""
        # Population for each class in current node. The predicted class is the one with
        # largest population.
        num_samples_per_class = [np.sum(y == i) for i in range(self.n_classes_)]
        predicted_class = np.argmax(num_samples_per_class)
        node = tree.Node(
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
                #node.ref = self.nb_nodes
                #self.nb_nodes += 1
                node.left = self._grow_tree(X_left, y_left, depth + 1)
                node.right = self._grow_tree(X_right, y_right, depth + 1)
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
        return accuracy_score(Y_test, Y_pred)
    
    def generate_dict(self, node=None):
        if not node:
            node = self.tree_
        dict = node.__dict__
        if dict['left']:
            dict['left'] = self.generate_dict(dict['left'])
            dict['right'] = self.generate_dict(dict['right'])
        return dict
    
    def print_tree(self, feature_names, class_names, tree=None, indent=" "):
        ''' function to print the tree '''
        #needed_keys = ['left', 'right', 'threshold']
        if not tree:
            tree = self.tree_
            dict = tree.__dict__
            #dict = {k:dict[k] for k in needed_keys}
        else:
            dict = tree
        
        if not dict['right']:
            print(class_names[dict['predicted_class']])
        else:
            print(feature_names[dict['feature_index']], "<=", dict['threshold'], "?", dict['gini'])
            print("%sleft:" % (indent), end="")
            self.print_tree(feature_names, class_names, dict['left'], indent + indent)
            print("%sright:" % (indent), end="")
            self.print_tree(feature_names, class_names, dict['right'], indent + indent)

    def string_tree(self, feature_names, class_names, tree=None, indent=" ", final_str=""):
        ''' function to print the tree '''
        #needed_keys = ['left', 'right', 'threshold']
        if not tree:
            tree = self.tree_
            dict = tree.__dict__
            #dict = {k:dict[k] for k in needed_keys}
        else:
            dict = tree
        
        if not dict['right']:
            final_str = final_str + "\n"+ class_names[dict['predicted_class']]
        else:
            final_str = final_str + "\n"+ (feature_names[dict['feature_index']], "<=", dict['threshold'], "?", dict['gini'], final_str)
            final_str = final_str + "\n"+ ("%sleft:" % (indent))
            final_str = final_str + "\n"+ self.print_tree(feature_names, class_names, dict['left'], indent + indent, final_str)
            final_str = final_str + "\n"+ ("%sright:" % (indent))
            final_str = final_str + "\n"+ self.print_tree(feature_names, class_names, dict['right'], indent + indent, final_str)

