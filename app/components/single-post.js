import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// my components
import Page from './page';
import LoadingDots from './loading-dots';

function SinglePost() {
  const { id } = useParams();

  const [singlePostData, setSinglePostData] = useState(null);

  useEffect(() => {
    // (1. CREATION OF A TOKEN)
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        // (2. ASSIGNING OF TOKEN)
        const serverResponse = await axios.get(`/post/${id}`, { cancelToken: axiosRequestRef.token });

        setSinglePostData(serverResponse.data);
      } catch (err) {
        console.log(err);
      }
    })();

    // (3. USAGE OF TOKEN)
    return () => axiosRequestRef.cancel();
  }, []);

  // if the data isn't available yet:
  if (!singlePostData)
    return (
      <Page title="Loading...">
        <LoadingDots />
      </Page>
    );

  return (
    // not-understood problem discovered: the title doesn't change by default, we have to watch for singlePostData.title in the composition's useEffect function
    <Page title={singlePostData.title} narrow={true}>
      <div className="d-flex justify-content-between">
        <h2>{singlePostData.title}</h2>
        <span className="pt-2">
          <a href="#" className="text-primary mr-2" title="Edit">
            <i className="fas fa-edit"></i>
          </a>
          <a className="delete-post-button text-danger" title="Delete">
            <i className="fas fa-trash"></i>
          </a>
        </span>
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${singlePostData.author.username}`}>
          <img className="avatar-tiny" src={singlePostData.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${singlePostData.author.username}`}>{singlePostData.author.username}</Link> on {new Date(singlePostData.createdDate).toDateString()}
      </p>

      <div className="body-content">
        <p>{singlePostData.body}</p>
      </div>
    </Page>
  );
}

export default SinglePost;
