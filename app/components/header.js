import React from 'react';
import { Link } from 'react-router-dom';

// my components
import HeaderLoggedOut from './header-logged-out';

function Header() {
  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            SocialApp
          </Link>
        </h4>
        <HeaderLoggedOut />
      </div>
    </header>
  );
}

export default Header;
