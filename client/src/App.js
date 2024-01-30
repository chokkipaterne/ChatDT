import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import AboutPage from 'pages/AboutPage';
import ErrorPage from 'pages/ErrorPage';
import Layout from 'components/Layout';
import { useSelector } from 'react-redux';
import FilePage from 'pages/FilePage';

function App() {
  const hasFile = Boolean(useSelector((state) => state.dtfile));

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path='/'
            element={!hasFile ? <FilePage /> : <Navigate to='/home' />}
          />
          <Route
            path='/home'
            element={hasFile ? <HomePage /> : <Navigate to='/' />}
          />
          <Route path='/about' element={<AboutPage />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
