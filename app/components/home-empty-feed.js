import React, { useContext } from 'react';

// my contexts
import ExampleContext from '../contexts/example-context';

function HomeEmptyFeed() {
  const { userCredentials } = useContext(ExampleContext);

  return (
    <>
      <h2 className="text-center">
        Hello <strong>{userCredentials.username}</strong>, your feed is empty.
      </h2>
      <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
    </>
  );
}

export default HomeEmptyFeed;
