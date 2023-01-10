import React, { useContext } from 'react';

// my contexts
import StateContext from '../contexts/state-context';

// my components
import Page from './page';
import HomeGuest from './home-guest';
import HomeEmptyFeed from './home-empty-feed';

function Home() {
  const retrievedStateRef = useContext(StateContext);

  return (
    <Page title="Home" narrow={false}>
      {retrievedStateRef.userCredentials ? <HomeEmptyFeed /> : <HomeGuest />}
    </Page>
  );
}

export default Home;
