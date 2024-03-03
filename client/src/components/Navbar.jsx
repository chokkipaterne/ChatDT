import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setReset } from 'state';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dtfile = useSelector((state) => state.dtfile);

  const removeData = async () => {
    const formData = new FormData();
    formData.append('filename', dtfile);
    console.log(dtfile);
    if (dtfile !== null) {
      try {
        const endpoint = `${process.env.REACT_APP_API_URL}removedata`;
        const removeFileResponse = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        const removedFile = await removeFileResponse.json();
        console.log(removedFile);
        if (removedFile) {
          dispatch(setReset());
          navigate('/');
        } else {
          console.error('Failed to remove file');
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      dispatch(setReset());
      navigate('/');
    }
  };

  return (
    <div className='w-full z-50'>
      <div className='navbar bg-primary drop-shadow-xl'>
        <div className='navbar-start'>
          <Link to='/home' className='text-3xl text-white font-bold'>
            ChatDT
          </Link>
        </div>
        <div className='navbar-end'>
          <Link to='/about' className='p-2 text-white font-medium'>
            About
          </Link>
          <button
            className='btn rounded-full mx-2 text-primary font-medium bg-white'
            onClick={async () => {
              await removeData();
            }}
          >
            New File
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
