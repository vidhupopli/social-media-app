import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// my components
import LoadingDots from './loading-dots';

function ProfilePosts() {
  const { username } = useParams();

  const [isLoading, setIsLoading] = useState(true); //data hasn't successfully loaded yet from axios request
  const [posts, setPosts] = useState([]); //posts data

  // runs 1) when the compo is mounted, 2) when the url changes
  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        const serverResponse = await axios.get(`/profile/${username}/posts`, { cancelToken: axiosRequestRef.token });

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
      {posts.map(postData => (
        <Link to={`/post/${postData._id}`} className="list-group-item list-group-item-action" key={postData._id}>
          <img className="avatar-tiny" src={postData.author.avatar} /> <strong>{postData.title}</strong>
          <span className="text-muted small"> on {new Date(postData.createdDate).toLocaleDateString()} </span>
        </Link>
      ))}
    </div>
  );
}

export default ProfilePosts;
