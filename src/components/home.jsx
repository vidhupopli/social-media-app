import React, { useContext, useEffect } from 'react';
import { useImmer } from 'use-immer';
import axios from 'axios';

// my contexts
import GlobalStateContext from '../contexts/state-context';
import GlobalStateUpdatorContext from '../contexts/state-updator-context';

// my components
import Page from './page';
import HomeGuest from './home-guest';
import HomeEmptyFeed from './home-empty-feed';
import LoadingDots from './loading-dots';
import Post from './Post';

function Home() {
  const globalState = useContext(GlobalStateContext);
  const globalStateUpdator = useContext(GlobalStateUpdatorContext);

  const initialValue = {
    isLoading: true,
    feed: []
  };
  const [localState, setLocalState] = useImmer(initialValue);

  // For making the network request upon component mount to obtain the latest feed | runs the first time this compo is rendered
  useEffect(() => {
    // Do not run this useEffect if the data if token is not available as we cannot ask for a feed without a token.
    const tokenNotAvailable = !globalState.userCredentials;
    if (tokenNotAvailable) return;

    const axiosRequestRef = axios.CancelToken.source();
    (async function () {
      try {
        const serverResponse = await axios.post('/getHomeFeed', { token: globalState.userCredentials.token }, { cancelToken: axiosRequestRef.token });

        setLocalState(curVal => {
          curVal.isLoading = false;
          curVal.feed = serverResponse.data;
        });
      } catch (err) {
        globalStateUpdator({ type: 'logout' });
        globalStateUpdator({ type: 'addFlashMessage', newMessage: 'your session has expired' });
      }
    })();

    return () => axiosRequestRef.cancel();
  }, [globalState.userCredentials]);

  // If the user is not even logged in then render this piece of jsx.
  if (!globalState.userCredentials) {
    return (
      <Page title="Home" narrow={false}>
        <HomeGuest />
      </Page>
    );
  }

  // render this JSX if the user is logged in, and if he is indeed logged in, network request is still being made trying to retrieve a feed to display.
  if (localState.isLoading) {
    return (
      <Page title="Loading" narrow={false}>
        <LoadingDots />
      </Page>
    );
  }

  // render this jsx if the user is logged in, and the network request to obtain their feed has been successful. Feed maybe an array of no items.
  return (
    <Page title="Home" narrow={false}>
      {localState.feed.length === 0 ? (
        <HomeEmptyFeed />
      ) : (
        <>
          <h2 className="text-center mb-4">Latest From Those You Follow</h2>
          <div className="list-group">
            {[
              localState.feed.map(post => {
                // code here
                return <Post post={post} key={post._id} />;
              })
            ]}
          </div>
        </>
      )}
    </Page>
  );
}

export default Home;
