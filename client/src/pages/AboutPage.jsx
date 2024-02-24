import Instructions from 'components/Instructions';

const AboutPage = () => {
  return (
    <div className='pt-5 px-2 max-w-2xl mt-1 text-slate-600 mx-auto pb-4'>
      <div className='card lg:card-side bg-base-100 shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title'>
            Welcome to ChatDT, your personalized guide to seamless decision tree
            creation!
          </h2>
          <p className='mb-3'>
            <b>ChatDT</b> is designed to empower you with the ability to
            effortlessly build{' '}
            <b>classification and regression decision trees</b>. ChatDT offers a
            user-friendly interface, allowing you to create or modify decision
            trees through intuitive commands. No need for complicated forms or
            coding – just chat and watch your decision tree come to life.
          </p>

          <Instructions />

          <p className='text-xl font-semibold'>Demo datasets</p>
          <div className='pt-2 pl-3'>
            <ul className='list-disc pl-2'>
              <li key='10' className='mb-2'>
                <b>Iris: </b>
                <a
                  className='link'
                  href='https://archive.ics.uci.edu/dataset/53/iris'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://archive.ics.uci.edu/dataset/53/iris
                </a>
              </li>
              <li key='30' className='mb-2'>
                <b>Wine quality: </b>
                <a
                  className='link'
                  href='https://archive.ics.uci.edu/dataset/186/wine+quality'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://archive.ics.uci.edu/dataset/186/wine+quality
                </a>
              </li>
              <li key='40' className='mb-2'>
                <b>Breast cancer: </b>
                <a
                  className='link'
                  href='https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic
                </a>
              </li>
              <li key='50' className='mb-2'>
                <b>Glass identification: </b>
                <a
                  className='link'
                  href='https://archive.ics.uci.edu/dataset/42/glass+identification'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://archive.ics.uci.edu/dataset/42/glass+identification
                </a>
              </li>
              <li key='60' className='mb-2'>
                <b>Adult: </b>
                <a
                  className='link'
                  href='http://archive.ics.uci.edu/dataset/2/adult'
                  target='_blank'
                  rel='noreferrer'
                >
                  http://archive.ics.uci.edu/dataset/2/adult
                </a>
              </li>
              <li key='70' className='mb-2'>
                <b>Student: </b>
                <a
                  className='link'
                  href='https://archive.ics.uci.edu/dataset/320/student+performance'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://archive.ics.uci.edu/dataset/320/student+performance
                </a>
              </li>
            </ul>
          </div>

          <p className='text-xl font-semibold'>Contact us</p>
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
