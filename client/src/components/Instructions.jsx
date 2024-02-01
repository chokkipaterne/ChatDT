const Instructions = () => {
  const instructionsArray = [
    'set features to [column_names separated by comma] : by default it takes all the columns except the last column.',
    'set target to [column_name] : by default the target column is the last column.',
    'set training data size to [train_size] : by default 0.7 (i.e., 70%)',
    'set max depth to [max_depth]',
    'set min samples split to [min_samples_split]',
    'generate',
  ];
  return (
    <>
      <p className='text-xl font-semibold'>List of Instruments</p>
      <p className='text-gray-500'>
        As of now, you can use the following commands to interact with ChatDT.
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
