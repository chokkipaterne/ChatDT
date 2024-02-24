"""Binary tree with decision tree semantics and ASCII visualization."""

class Node:
    """A decision tree node for classification."""
    def __init__(self, gini, num_samples, num_samples_per_class, predicted_class):
        self.gini = gini
        self.num_samples = num_samples
        self.num_samples_per_class = num_samples_per_class # for classification only
        self.predicted_class = predicted_class
        self.feature_index = 0
        self.threshold = 0
        self.left = None
        self.right = None
        self.ref = 0
        self.ref_init = 0
        self.is_categorical = 0
        self.operator = '<'

class NodeRegression:
    """A decision tree node for regression."""
    def __init__(self, num_samples, value):
        self.num_samples = num_samples
        self.value = value #for regression predicted_class is value
        self.feature_index = 0
        self.threshold = 0
        self.left = None
        self.right = None
        self.ref = 0
        self.ref_init = 0
        self.var_red = 0 #for regression only variance reduction
        self.is_categorical = 0
        self.operator = '<'