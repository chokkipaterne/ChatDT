import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setInit } from 'state';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const dtfile = useSelector((state) => state.dtfile);

  useEffect(() => {
    if (dtfile !== null) {
      navigate('/home');
    }
  }, [dtfile]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out',
  };

  const focusedStyle = {
    borderColor: '#2196f3',
  };

  const acceptStyle = {
    borderColor: '#00e676',
  };

  const rejectStyle = {
    borderColor: '#ff1744',
  };

  const onDrop = useCallback((acceptedFiles) => {
    const submitFile = async (file) => {
      const formData = new FormData();
      formData.append('uploaded_file', file);
      try {
        const endpoint = `${process.env.REACT_APP_API_URL}upload`;
        const savedFileResponse = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        const savedFile = await savedFileResponse.json();
        console.log(savedFile);
        if (savedFile) {
          dispatch(
            setInit({
              dtfile: savedFile.file,
              messages: [],
            })
          );
          navigate('/home');
          console.log('File uploaded successfully');
        } else {
          setFile(null);
          setDisabled(false);
          console.error('Failed to upload file');
        }
      } catch (error) {
        setFile(null);
        setDisabled(false);
        console.log(error);
      }
    };

    acceptedFiles.forEach(async (file) => {
      setFile(file);
      setDisabled(true);
      await submitFile(file);
    });
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      disabled: disabled,
      maxFiles: 1,
      accept: { 'text/csv': ['.csv'] },
    });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div className='absolute top-40 w-full'>
      <div className='items-center text-center'>
        <div className='w-full px-1'>
          <h1 className='mr-3 text-3xl font-semibold text-primary'>
            ChatDT: A <u>Chat</u>bot for a <u>D</u>ecision <u>T</u>ree Creation
          </h1>
        </div>
        <p className='max-w-xl mt-1 text-xl text-slate-600 mx-auto px-1'>
          Start by uploading your dataset (only csv format allowed)
        </p>
        <div className='max-w-xl mt-1 text-lg text-slate-600 mx-auto py-11 px-1'>
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            {file && disabled && <p>{file.name} uploaded successfully</p>}
            {(!file || !disabled) && (
              <>
                <p>Drag and drop your file here, or click to select file</p>
                <em>(Only *.csv files will be accepted)</em>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
