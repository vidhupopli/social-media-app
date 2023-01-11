import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// my components
import Page from './page';
import LoadingDots from './loading-dots';

function SinglePost() {
  const { id } = useParams();

  const [singlePostData, setSinglePostData] = useState(null);

  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        const serverResponse = await axios.get(`/post/${id}`, { cancelToken: axiosRequestRef.token });

        setSinglePostData(serverResponse.data);
      } catch (err) {
        console.log(err);
      }
    })();

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
        {/* <p>{singlePostData.body}</p> */}
        <ReactMarkdown children={singlePostData.body} allowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em']} />
      </div>
    </Page>
  );
}

export default SinglePost;
