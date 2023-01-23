// when component abstracting, this line is important
import React, { useContext, useEffect } from 'react';
// this is immer's variant of useState. Just like useImmerReducer is variant of useReducer.
import { useImmer } from 'use-immer';
import axios from 'axios';

// my contexts
import GlobalStateUpdatorContext from '../contexts/state-updator-context';

function Search() {
  const globalStateUpdator = useContext(GlobalStateUpdatorContext);

  const initialLocalStateValue = {
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0
  };
  const [localState, setLocalState] = useImmer(initialLocalStateValue);

  const searchKeyPressHandler = function (e) {
    // **this function by default runs everytime a key is pressed** //

    // esc key happens to have the keyCode of 27
    if (e.keyCode === 27) {
      globalStateUpdator({ type: 'closeSearch' });
    }
  };

  // For attaching keyboard event listner to Document obj | Runs the everytime the component is mounted.
  useEffect(() => {
    // New event listener is added if <Search /> is mounted.
    document.addEventListener('keyup', searchKeyPressHandler);

    // returning a cleanup function, which runs when <Search /> is unmounted.
    // we wanna get rid of the event listner we had attached to the document obj.
    return () => document.removeEventListener('keyup', searchKeyPressHandler);
  }, []);

  // For signalling network request after a delay | Runs when compo is mounted and everytime the localState's particular property changes
  useEffect(() => {
    // everytime the inputField has been changed, this timeout is being created.
    const delay = setTimeout(() => {
      setLocalState(curStateVal => {
        // to signal running of the next useEffect
        curStateVal.requestCount++;
      });
    }, 3000);

    // Note: returning a cleanup function. Cleanup function doesn't just run when the component unmounts, but also, cleanup function of the first instance of useEffect runs when the next useEffect runs. Only after the cleanup of the previous useEffect has run, the next useEffect runs.
    return () => clearTimeout(delay);
  }, [localState.searchTerm]);

  // For making network request | Runs the first time compo is mounted and everytime property of localState changes - which is what happens when the input field has been changed and another useEffect sends the signal to make the network req.
  useEffect(() => {
    // Do nothing if this is the first time the useEffect has been run. Which is what happens when the component is mounted.
    if (localState.requestCount === 0) return;

    const axiosReqRef = axios.CancelToken.source();
    // Make network request:
    (async function () {
      try {
        const url = '/search';
        const dataToSend = { searchTerm: localState.searchTerm };
        const cancelToken = { cancelToken: axiosReqRef.token };
        const serverResponse = await axios.post(url, dataToSend, cancelToken);

        setLocalState(curVal => {
          curVal.results = serverResponse.data;
        });
      } catch (err) {
        console.log(err);
      }
    })();

    // return cleanup function
    return () => axiosReqRef.cancel();
  }, [localState.requestCount]);

  const inputHandler = function (e) {
    // updating local state
    const inputValue = e.target.value;
    setLocalState(curStateVal => {
      curStateVal.searchTerm = inputValue;
    });
  };

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={inputHandler} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          {/* Close button */}
          <span onClick={e => globalStateUpdator({ type: 'closeSearch' })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className="live-search-results live-search-results--visible">
            <div className="list-group shadow-sm">
              <div className="list-group-item active">
                <strong>Search Results</strong> ({localState.results.length} items found)
              </div>
              {/* search result items below */}
              {[
                localState.results.map((result, index) => {
                  return (
                    <a key={index} href="#" className="list-group-item list-group-item-action">
                      <img className="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" /> <strong>{result.title}</strong>{' '}
                      <span className="text-muted small">
                        by {result.author.username} on {new Date(result.createdDate).toLocaleDateString()}
                      </span>
                    </a>
                  );
                })
              ]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
