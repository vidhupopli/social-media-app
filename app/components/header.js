import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// my components
import HeaderLoggedOut from './header-logged-out';
import HeaderLoggedIn from './header-logged-in';

function Header() {
  const [userData, setUserData] = useState(null);

  // function executes first time Header component is rendered
  useEffect(() => {
    const obtainedStringifiedData = localStorage.getItem('persistedUserData');

    //if data exists, update react user data state
    if (obtainedStringifiedData) {
      setUserData(JSON.parse(obtainedStringifiedData));
    }
  }, []);

  // function runs everytime userData state is updated
  useEffect(() => {
    // if no userData then persist a falsy value
    if (!userData) localStorage.setItem('persistedUserData', '');

    const stringifiedUserData = JSON.stringify(userData);

    localStorage.setItem('persistedUserData', stringifiedUserData);
  }, [userData]);

  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            SocialApp
          </Link>
        </h4>
        {userData ? <HeaderLoggedIn userData={userData} setUserData={setUserData} /> : <HeaderLoggedOut setUserData={setUserData} />}
      </div>
    </header>
  );
}

export default Header;
