import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// my components
import Header from './components/header';
import Footer from './components/footer';
import Home from './components/home';
import About from './components/about';
import Terms from './components/terms';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Main() {
  const [userCredentials, setUserCredentials] = useState(null);

  // function executes first time Main component is rendered
  useEffect(() => {
    const obtainedStringifiedData = localStorage.getItem('persistedUserData');

    //if data exists, update react user data state
    if (obtainedStringifiedData) {
      setUserCredentials(JSON.parse(obtainedStringifiedData));
    }
  }, []);

  // function runs everytime userCredentials state is updated
  useEffect(() => {
    // if no userCredentials then persist a falsy value
    if (!userCredentials) return localStorage.setItem('persistedUserData', '');

    const stringifiedUserData = JSON.stringify(userCredentials);

    localStorage.setItem('persistedUserData', stringifiedUserData);
  }, [userCredentials]);

  return (
    <BrowserRouter>
      <Header userCredentials={userCredentials} setUserCredentials={setUserCredentials} />
      <Routes>
        <Route path="/" element={<Home userCredentials={userCredentials} />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
