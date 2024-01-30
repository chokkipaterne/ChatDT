import FileUpload from 'components/FileUpload';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FilePage = () => {
  const navigate = useNavigate();
  const dtfile = useSelector((state) => state.dtfile);

  useEffect(() => {
    if (dtfile !== null) {
      navigate('/home');
    }
  }, [dtfile, navigate]);

  return <FileUpload />;
};

export default FilePage;
