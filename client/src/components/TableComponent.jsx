import { useSelector } from 'react-redux';

const TableComponent = () => {
  const table = useSelector((state) => state.table);
  // Extract column names from the first item in the table list
  const columns = table.length > 0 ? Object.keys(table[0]) : [];

  return (
    <>
      <p className='text-xl font-semibold'>Table Content</p>
      <p className='text-gray-500'>
        Only 30 random rows of the file are displayed.
      </p>
      <div className='pt-4'>
        <table className='min-w-full bg-white border border-gray-300'>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className='py-2 px-4 border-b text-left'>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column} className='py-2 px-4 border-b'>
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableComponent;
