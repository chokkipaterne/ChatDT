import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <main className='h-96 w-full flex flex-col justify-center items-center bg-transparent'>
      <h1 className='text-9xl font-extrabold text-light-gray tracking-widest'>
        404
      </h1>
      <div className='bg-gradient-to-r from-primary to-neutral px-2 text-sm rounded rotate-12 absolute text-white'>
        Page Not Found
      </div>
      <button className='mt-5'>
        <Link
          to='/'
          className='relative inline-block text-sm font-medium text-white focus:outline-none focus:ring'
        >
          <span className='absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-gradient-to-r from-primary to-neutral group-hover:translate-y-0 group-hover:translate-x-0'></span>

          <span className='relative block px-8 py-3 border border-current'>
            Go Home
          </span>
        </Link>
      </button>
    </main>
  );
};

export default ErrorPage;
