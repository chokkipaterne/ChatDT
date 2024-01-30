import { Link } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { setReset } from 'state';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className='w-full'>
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
            className='btn rounded-full mx-2 text-primary font-medium'
            onClick={() => {
              dispatch(setReset());
              navigate('/home');
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
