import React from 'react';

// my components
import Page from './page';
import HomeGuest from './home-guest';
import HomeEmptyFeed from './home-empty-feed';

function Home(props) {
  return (
    <Page title="Home" narrow={false}>
      {props.userCredentials ? <HomeEmptyFeed userCredentials={props.userCredentials} /> : <HomeGuest />}
    </Page>
  );
}

export default Home;
