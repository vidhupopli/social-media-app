import React, { useReducer, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

const root = ReactDOM.createRoot(document.getElementById('root'));

function Main() {
  const initalStateVal = {
    userCredentials: null,
    flashMessages: []
  };

  const customUpdateStateFn = function (currStateVal, phActionObj) {
    switch (phActionObj.type) {
      case 'saveUserCredentials':
        // cannot mutate therefore entire obj has to rebuilt
        return { userCredentials: phActionObj.data, flashMessages: currStateVal.flashMessages };
      case 'addFlashMessage':
        return {
          userCredentials: currStateVal.userCredentials,
          flashMessages: currStateVal.flashMessages.concat(phActionObj.newMessage)
        };
      default:
        throw new Error('Invalid action type');
    }
  };

  const [stateRef, wrapperUpdateStateFn] = useReducer(customUpdateStateFn, initalStateVal);

  /////////////////////
  //loading and persisting state data
  /////////////////////
  // function executes first time Main component is rendered
  useEffect(() => {
    const obtainedStringifiedData = localStorage.getItem('persistedUserData');

    //if data exists, update react user data state
    if (obtainedStringifiedData) {
      wrapperUpdateStateFn({ type: 'saveUserCredentials', data: JSON.parse(obtainedStringifiedData) });
    }
  }, []);

  // function runs [hopefully] everytime userCredentials portion of the state is updated
  useEffect(() => {
    // if no userCredentials then persist a falsy value. Do nothing further.
    if (!stateRef.userCredentials) return localStorage.setItem('persistedUserData', '');

    const stringifiedUserData = JSON.stringify(stateRef.userCredentials);

    localStorage.setItem('persistedUserData', stringifiedUserData);
  }, [stateRef.userCredentials]); //[hoping] that you can watch for a subset of the state rather than watching for the whole state
  /////////////////////

  return (
    // nested contexts because if there was only one, then those components which only need wrapperUpdateStateFn, will be re-renderd everytime stateRef is updated.
    <StateContext.Provider value={stateRef}>
      <StateUpdatorContext.Provider value={wrapperUpdateStateFn}>
        <BrowserRouter>
          <FlashMessages />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<SinglePost />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </StateUpdatorContext.Provider>
    </StateContext.Provider>
  );
}

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
