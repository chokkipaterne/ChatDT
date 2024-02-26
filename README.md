Welcome to ChatDT, your personalized guide to seamless decision tree creation!
ChatDT is designed to empower you with the ability to effortlessly build classification and regression decision trees. ChatDT offers a user-friendly interface, allowing you to create or modify decision trees through intuitive commands. No need for complicated forms or coding – just chat and watch your decision tree come to life.

List of commands

As of now, we have defined 17 commands that can be used to interact with ChatDT.

##Commands for creating a decision tree

set features to [column_names separated by comma] : by default it takes all the columns except the last column.
set target to [column_name] : by default the target column is the last column.
set training data size to [train_size] : by default 0.7 (i.e., 70%)
set max depth to [max_depth]
set min samples split to [min_samples_split]
Commands to update an existing decision tree (these commands should be used after the creation of a decision tree, not before)

set node [node_number] to [column_name] with a threshold of [threshold]: threshold can be a numerical value if the column is numerical, or it can be one or multiple categories of the column if the column is categorical
set node [node_number] to one of the following features: [column_names separated by comma]
set node [node_number] to any feature except the following: [column_names separated by comma]
remove tree from node [node_number]
Commands to update the layout of an existing decision tree (these commands should be used once the user is satisfied about the generated decision tree but just wants to change the look and feel of the generated decision tree)

set root node color to [color]: by default red
set root node size to [size]: by default 30
set branch node color to [color]: by default blue
set branch node size to [size]: by default 20
set leaf node color to [color]: by default green
set leaf node size to [size]: by default 25
This command should be called to create a decision tree after the user sets up its settings/constraints

generate
This command should be called to see all the commands

help
Demo datasets

Iris: https://archive.ics.uci.edu/dataset/53/iris
Wine quality: https://archive.ics.uci.edu/dataset/186/wine+quality
Breast cancer: https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic
Glass identification: https://archive.ics.uci.edu/dataset/42/glass+identification
Adult: http://archive.ics.uci.edu/dataset/2/adult
Student: https://archive.ics.uci.edu/dataset/320/student+performance
Contact us

Any issues or suggestions, feel free to Contact Us
