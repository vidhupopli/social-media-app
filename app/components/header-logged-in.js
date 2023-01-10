import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

// my contexts
import StateContext from '../contexts/state-context';
import StateUpdatorContext from '../contexts/state-updator-context';

function HeaderLoggedIn() {
  const retrievedStateRef = useContext(StateContext);
  const retrievedWrapperUpdateStateFn = useContext(StateUpdatorContext);

  const userLogoutHandler = e => {
    retrievedWrapperUpdateStateFn({ type: 'logout' });
  };

  return (
    <div className="flex-row my-3 my-md-0">
      <a href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <span className="mr-2 header-chat-icon text-white">
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white"> </span>
      </span>
      <a href="#" className="mr-2">
        <img className="small-header-avatar" src={retrievedStateRef.userCredentials.avatar} />
      </a>
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      <button onClick={userLogoutHandler} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
