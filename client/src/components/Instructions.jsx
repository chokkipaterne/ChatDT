const Instructions = () => {
  const instructionsArray = [
    'set features to [column_names separated by comma] : by default it takes all the columns except the last column.',
    'set target to [column_name] : by default the target column is the last column.',
    'set training data size to [train_size] : by default 0.7 (i.e., 70%)',
    'set max depth to [max_depth]',
    'set min samples split to [min_samples_split]',
    'set node [node_number] to [column_name] with a threshold of [threshold]',
    'set node [node_number] to one of the following features: [column_names separated by comma]',
    'set node [node_number] to any feature except the following: [column_names separated by comma]',
    'remove tree from node [node_number]',
    'set root node color to [color]: by default red',
    'set root node size to [size]: by default 30',
    'set branch node color to [color]: by default blue',
    'set branch node size to [size]: by default 20',
    'set leaf node color to [color]: by default green',
    'set leaf node size to [size]: by default 25',
    'generate',
  ];
  return (
    <>
      <p className='text-xl font-semibold'>List of commands</p>
      <p className='text-gray-500'>
        As of now, we have defined <b>16 commands</b> that can be used to
        interact with ChatDT.
      </p>

      <div className='pt-4 pl-3'>
        <ul className='list-disc pl-2'>
          {instructionsArray.map((instruction, index) => (
            <li key={index} className='mb-2'>
              {instruction}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Instructions;
