import React, { useContext } from 'react';

// my components
import Page from './page';
import HomeGuest from './home-guest';
import HomeEmptyFeed from './home-empty-feed';

// my contexts
import ExampleContext from '../contexts/example-context';

function Home() {
  const { userCredentials } = useContext(ExampleContext);
  return (
    <Page title="Home" narrow={false}>
      {userCredentials ? <HomeEmptyFeed /> : <HomeGuest />}
    </Page>
  );
}

export default Home;
