import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// my components
import LoadingDots from './loading-dots';

function ProfileFollowers() {
  const { username } = useParams();

  const [isLoading, setIsLoading] = useState(true); //data hasn't successfully loaded yet from axios request
  const [posts, setPosts] = useState([]); //posts data

  // runs 1) when the compo is mounted, 2) when the url changes
  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        const serverResponse = await axios.get(`/profile/${username}/followers`, { cancelToken: axiosRequestRef.token });

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
      {posts.map((follower, index) => (
        <Link to={`/profile/${follower.username}`} className="list-group-item list-group-item-action" key={index}>
          <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
        </Link>
      ))}
    </div>
  );
}

export default ProfileFollowers;
