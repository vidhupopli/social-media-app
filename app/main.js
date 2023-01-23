import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useImmerReducer } from 'use-immer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
// CSS file needed by Tooltip components throughout the app
import './../node_modules/react-tooltip/dist/react-tooltip.css';

// setting up baseUrl to be used with axios
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8080/';

// my contexts
import StateContext from './contexts/state-context';
import StateUpdatorContext from './contexts/state-updator-context';

// my components
import Header from './components/header';
import Footer from './components/footer';
import Home from './components/home';
import About from './components/about';
import Terms from './components/terms';
import CreatePost from './components/create-post';
import SinglePost from './components/single-post';
import FlashMessages from './components/flash-messages';
import Profile from './components/profile';
import EditPost from './components/edit-post';
import PageNotFound from './components/page-not-found';
import Search from './components/search';

function Main() {
  const initalStateVal = {
    userCredentials: null,
    flashMessages: [],
    isSearchOpen: false
  };

  const customUpdateStateFn = function (currMutableStateVal, phActionObj) {
    switch (phActionObj.type) {
      case 'logout':
        currMutableStateVal.userCredentials = null;
        break;
      case 'login':
        currMutableStateVal.userCredentials = phActionObj.data;
        // can also return undefined by just writing return;
        break;
      case 'addFlashMessage':
        currMutableStateVal.flashMessages.push(phActionObj.newMessage);
        break;
      case 'openSearch':
        currMutableStateVal.isSearchOpen = true;
        break;
      case 'closeSearch':
        currMutableStateVal.isSearchOpen = false;
        break;
      default:
        throw new Error('Invalid action type');
    }
  };

  const [globalState, globalStateUpdator] = useImmerReducer(customUpdateStateFn, initalStateVal);

  /////////////////////
  //loading and persisting state data
  /////////////////////
  // when main component is mounted:
  useEffect(() => {
    const obtainedStringifiedData = localStorage.getItem('persistedUserData');

    //if data exists, update react user data state
    if (obtainedStringifiedData) {
      globalStateUpdator({ type: 'login', data: JSON.parse(obtainedStringifiedData) });
    }
  }, []);

  // when portion of state changes:
  useEffect(() => {
    // if userCredentials in state is null then remove persisted user data. Do nothing further.
    if (!globalState.userCredentials) return localStorage.removeItem('persistedUserData');

    // otherwise:-
    const stringifiedUserData = JSON.stringify(globalState.userCredentials);
    localStorage.setItem('persistedUserData', stringifiedUserData);
  }, [globalState.userCredentials]);
  /////////////////////

  return (
    <StateContext.Provider value={globalState}>
      <StateUpdatorContext.Provider value={globalStateUpdator}>
        <BrowserRouter>
          <FlashMessages />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<SinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/profile/:username*" element={<Profile />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Footer />
          {/* 330ms, bool val to determine when to render search, multiple css classes as per spec referenced using 'search-overlay' */}
          <CSSTransition timeout={330} in={globalState.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
        </BrowserRouter>
      </StateUpdatorContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
