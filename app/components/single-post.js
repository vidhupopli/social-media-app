import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Tooltip } from 'react-tooltip';
import './../../node_modules/react-tooltip/dist/react-tooltip.css';

// my components
import Page from './page';
import LoadingDots from './loading-dots';

function SinglePost() {
  const { id } = useParams();
  const [singlePostData, setSinglePostData] = useState(null);

  // retrieve data
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

  // if data becomes available:
  return (
    <Page title={singlePostData.title} narrow={true}>
      <div className="d-flex justify-content-between">
        <h2>{singlePostData.title}</h2>
        <span className="pt-2">
          <a id="edit-button" data-tooltip-content="Edit" href="#" className="text-primary mr-2">
            <i className="fas fa-edit"></i>
          </a>
          <Tooltip anchorId="edit-button" />
          <a id="delete-button" data-tooltip-content="Delete" className="delete-post-button text-danger" title="Delete">
            <i className="fas fa-trash"></i>
          </a>
          <Tooltip anchorId="delete-button" />
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
