import pandas as pd

new_filename = "demo_student.csv"
path = f"uploads/{new_filename}"

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
