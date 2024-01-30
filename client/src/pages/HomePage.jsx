import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const dtfile = useSelector((state) => state.dtfile);

  useEffect(() => {
    if (dtfile === null) {
      navigate('/');
    }
  }, [dtfile]);

  return <div className='w-full pt-5 px-2'>HomePage</div>;
};

export default HomePage;
