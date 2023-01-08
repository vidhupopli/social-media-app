import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// my components
import Header from './components/header';
import Footer from './components/footer';
import HomeGuest from './components/home-guest';
import About from './components/about';
import Terms from './components/terms';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Main() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomeGuest />} />
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
