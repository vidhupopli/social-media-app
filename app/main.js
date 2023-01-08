import React from 'react';
import ReactDOM from 'react-dom/client';

// my components
import Header from './components/header';
import Footer from './components/footer';
import HomeGuest from './components/home-guest';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Main() {
  return (
    <>
      <Header />
      <HomeGuest />
      <Footer />
    </>
  );
}

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
