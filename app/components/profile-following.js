import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// my components
import LoadingDots from './loading-dots';

function ProfileFollowing() {
  const { username } = useParams();

  const [isLoading, setIsLoading] = useState(true); //data hasn't successfully loaded yet from axios request
  const [posts, setPosts] = useState([]); //posts data

  // runs 1) when the compo is mounted, 2) when the url changes
  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    // network request is made to obtain a profile's following list and stored in the state if the data has been recd.
    (async function () {
      try {
        const serverResponse = await axios.get(`/profile/${username}/following`, { cancelToken: axiosRequestRef.token });

        setPosts(serverResponse.data); //array of objects

        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosRequestRef.cancel();
  }, [username]);

  if (isLoading) {
    return <LoadingDots />;
  }

  return (
    <div className="list-group">
      {posts.map((following, index) => (
        // Flow is transferred to the BrowserRouter from main.js upon clicking
        <Link to={`/profile/${following.username}`} className="list-group-item list-group-item-action" key={index}>
          <img className="avatar-tiny" src={following.avatar} /> {following.username}
        </Link>
      ))}
    </div>
  );
}

export default ProfileFollowing;
