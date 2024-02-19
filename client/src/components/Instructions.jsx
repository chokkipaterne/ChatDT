const Instructions = ({ showGroup = 1 }) => {
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
    'help',
  ];
  return (
    <>
      {showGroup === 1 && (
        <>
          <p className='text-xl font-semibold'>List of commands</p>
          <p className='text-gray-500'>
            As of now, we have defined <b>17 commands</b> that can be used to
            interact with ChatDT.
          </p>
        </>
      )}
      {showGroup !== 1 && (
        <>
          <p className='text-md font-semibold'>
            {' '}
            As of now, we have defined <b>17 commands</b> that can be used to
            interact with ChatDT.
          </p>
        </>
      )}

      <div className='pt-4 pl-3'>
        <ul className='list-disc pl-2'>
          {instructionsArray.map((instruction, index) => (
            <div key={index}>
              {showGroup === 1 && (
                <>
                  {index === 0 && (
                    <p className='-ml-4'>
                      <b>Commands for creating a decision tree</b>
                    </p>
                  )}
                  {index === 5 && (
                    <p className='-ml-4'>
                      <b>
                        Commands to update an existing decision tree (these
                        commands should be used after the creation of a decision
                        tree, not before)
                      </b>
                    </p>
                  )}
                  {index === 9 && (
                    <p className='-ml-4'>
                      <b>
                        Commands to update the layout of an existing decision
                        tree (these commands should be used once the user is
                        satisfied about the generated decision tree but just
                        wants to change the look and feel of the generated
                        decision tree)
                      </b>
                    </p>
                  )}
                  {index === 15 && (
                    <p className='-ml-4'>
                      <b>
                        This command should be called to create a decision tree
                        after the user sets up its settings/constraints
                      </b>
                    </p>
                  )}
                  {index === 16 && (
                    <p className='-ml-4'>
                      <b>
                        This command should be called to see all the commands
                      </b>
                    </p>
                  )}
                </>
              )}
              <li key={index} className='mb-2'>
                {instruction}
              </li>
            </div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Instructions;
