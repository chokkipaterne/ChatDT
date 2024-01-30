const AboutPage = () => {
  return (
    <div className='pt-5 px-2 max-w-2xl mt-1 text-slate-600 mx-auto'>
      <div className='card lg:card-side bg-base-100 shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title'>
            Welcome to ChatDT, your personalized guide to seamless decision tree
            creation!
          </h2>
          <p>
            ChatDT is designed to empower you with the ability to effortlessly
            build decision trees. ChatDT offers a user-friendly interface,
            allowing you to create decision trees through natural and intuitive
            conversations. No need for complicated forms or coding – just chat
            and watch your decision tree come to life.
          </p>
          <br />
          <p>
            Any issues or suggestions, feel free to{' '}
            <a className='link' href='mailto:cpeterabiola@gmail.com'>
              Contact Us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
