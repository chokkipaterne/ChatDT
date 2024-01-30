import Navbar from './Navbar';
const Layout = (props) => {
  return (
    <div className='w-screen h-screen max-w-screen max-h-screen flex flex-col'>
      <Navbar />
      <div>{props.children}</div>
    </div>
  );
};

export default Layout;
