import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setInit } from 'state';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [disabled, setDisabled] = useState(false);

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

  const demoDataset = async (demo_dataset) => {
    setDisabled(true);
    const formData = new FormData();
    formData.append('demo_dataset', demo_dataset);
    try {
      const endpoint = `${process.env.REACT_APP_API_URL}demo`;
      const savedFileResponse = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const savedFile = await savedFileResponse.json();
      //console.log(savedFile);
      if (savedFile) {
        const initialMessages = [
          {
            text: 'I am ChatDT, an interactive chatbot that can help you to easily create a decision tree. Click on "i" to get more instructions about the commands to use to interact with me.',
            sender: 'bot',
            info: false,
            table: false,
            tree: false,
            back: null,
          },
          {
            text:
              'File ' + savedFile.filename + ' has been uploaded successfully.',
            sender: 'bot',
            info: true,
            table: true,
            tree: false,
            back: null,
          },
        ];
        dispatch(
          setInit({
            dtfile: savedFile.file,
            filename: savedFile.filename,
            columns: savedFile.columns,
            table: savedFile.table,
            messages: initialMessages,
            instructions: {},
            has_tree: false,
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

  const onDrop = useCallback(
    (acceptedFiles) => {
      const submitFile = async (file) => {
        const formData = new FormData();
        formData.append('uploaded_file', file);
        try {
          const endpoint = `${process.env.REACT_APP_API_URL}uploadfile`;
          const savedFileResponse = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });
          const savedFile = await savedFileResponse.json();
          console.log(savedFile);
          if (savedFile) {
            const initialMessages = [
              {
                text: 'I am ChatDT, an interactive chatbot that can help you to easily create a decision tree. Click on "i" to get more instructions about the commands to use to interact with me.',
                sender: 'bot',
                info: false,
                table: false,
                tree: false,
                back: null,
              },
              {
                text:
                  'File ' +
                  savedFile.filename +
                  ' has been uploaded successfully.',
                sender: 'bot',
                info: true,
                table: true,
                tree: false,
                back: null,
              },
            ];
            dispatch(
              setInit({
                dtfile: savedFile.file,
                filename: savedFile.filename,
                columns: savedFile.columns,
                table: savedFile.table,
                messages: initialMessages,
                instructions: {},
                has_tree: false,
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
    },
    [dispatch, navigate]
  );

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
        <div className='max-w-xl mt-1 text-lg text-slate-600 mx-auto pt-11 px-1'>
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            {file && disabled && <p>{file.name} uploaded successfully</p>}
            {(!file || !disabled) && (
              <>
                <p>Drag and drop your file here, or click to select file</p>
                <em>(Only *.csv file will be accepted)</em>
              </>
            )}
          </div>
        </div>
        <p className='max-w-xl mt-1 text-lg text-slate-600 mx-auto px-1 py-5'>
          OR use one of the following demo datasets:
          <br />
          <span className='text-sm'>
            <i>
              More details about the datasets can be found on the About page
            </i>
          </span>
        </p>
        <div className='pb-5 bg-white'>
          <button
            className={`btn ml-2 mb-2 rounded-full btn-md btn-primary ${
              disabled ? 'btn-disabled' : ''
            }`}
            onClick={async () => {
              await demoDataset('demo_iris.csv');
            }}
          >
            iris.csv
          </button>
          <button
            className={`btn ml-2 mb-2 rounded-full btn-md btn-primary ${
              disabled ? 'btn-disabled' : ''
            }`}
            onClick={async () => {
              await demoDataset('demo_breast_cancer.csv');
            }}
          >
            breast_cancer.csv
          </button>
          <button
            className={`btn ml-2 mb-2 rounded-full btn-md btn-primary ${
              disabled ? 'btn-disabled' : ''
            }`}
            onClick={async () => {
              await demoDataset('demo_glass_identification.csv');
            }}
          >
            glass_identification.csv
          </button>
          <button
            className={`btn ml-2 mb-2 rounded-full btn-md btn-primary ${
              disabled ? 'btn-disabled' : ''
            }`}
            onClick={async () => {
              await demoDataset('demo_wine_quality.csv');
            }}
          >
            wine_quality.csv
          </button>
          <button
            className={`btn ml-2 mb-2 rounded-full btn-md btn-primary ${
              disabled ? 'btn-disabled' : ''
            }`}
            onClick={async () => {
              await demoDataset('demo_adult.csv');
            }}
          >
            adult.csv
          </button>
          <button
            className={`btn ml-2 mb-2 rounded-full btn-md btn-primary ${
              disabled ? 'btn-disabled' : ''
            }`}
            onClick={async () => {
              await demoDataset('demo_student.csv');
            }}
          >
            student.csv
          </button>
          <br />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
