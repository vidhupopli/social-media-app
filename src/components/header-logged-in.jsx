import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

// my contexts
import GlobalStateContext from '../contexts/state-context';
import GlobalStateUpdatorContext from '../contexts/state-updator-context';

function HeaderLoggedIn() {
  const globalState = useContext(GlobalStateContext);
  const globalStateUpdator = useContext(GlobalStateUpdatorContext);

  const giveFlowToRouter = useNavigate();

  const userLogoutHandler = e => {
    globalStateUpdator({ type: 'logout' });
    globalStateUpdator({ type: 'addFlashMessage', newMessage: 'you have logged out' });
    giveFlowToRouter('/');
  };

  const openSearchHandler = function (e) {
    // To avoid default behaviour of clicking on an anchor element: that is navigatiing to an href link.
    e.preventDefault();
    globalStateUpdator({ type: 'openSearch' });
  };

  return (
    <div className="flex-row my-3 my-md-0">
      <a id="search-button" data-tooltip-content="Search" onClick={openSearchHandler} href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <Tooltip anchorId="search-button" />
      {/* can be used to put a single space between two elements, no matter how much space characters are inside the quotes though. */}{' '}
      <span onClick={e => globalStateUpdator({ type: 'toggleChat' })} id="chat-button" data-tooltip-content="Chat" className={'mr-2 header-chat-icon ' + (globalState.unreadChatCount ? 'text-danger' : 'text-white')}>
        <i className="fas fa-comment"></i>
        {globalState.unreadChatCount ? <span className="chat-count-badge text-white">{globalState.unreadChatCount < 10 ? globalState.unreadChatCount : '9+'}</span> : ''}
      </span>
      <Tooltip anchorId="chat-button" /> {/* Click on this below to give flow to router */}
      <Link id="profile-button" data-tooltip-content="Profile" to={`/profile/${globalState.userCredentials.username}`} className="mr-2">
        <img className="small-header-avatar" src={globalState.userCredentials.avatar} />
      </Link>{' '}
      <Tooltip anchorId="profile-button" />
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
