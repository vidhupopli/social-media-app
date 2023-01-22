import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Tooltip } from 'react-tooltip';
import './../../node_modules/react-tooltip/dist/react-tooltip.css';

// my contexts
import GlobalStateContext from '../contexts/state-context';
import GlobalStateUpdatorContext from '../contexts/state-updator-context';

// my components
import Page from './page';
import LoadingDots from './loading-dots';
import PageNotFound from './page-not-found';

function SinglePost() {
  const globalState = useContext(GlobalStateContext);
  const globalStateUpdator = useContext(GlobalStateUpdatorContext);
  const giveFlowToRouter = useNavigate();

  const { id } = useParams();
  const [singlePostData, setSinglePostData] = useState(null);
  const [postExists, setPostExists] = useState(true);

  // retrieve data
  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        const serverResponse = await axios.get(`/post/${id}`, { cancelToken: axiosRequestRef.token });

        if (!serverResponse.data) {
          setPostExists(false);
          return;
        }

        setSinglePostData(serverResponse.data);
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosRequestRef.cancel();
  }, []);

  // if the server sent no data intimating non-existence of post
  if (!postExists) {
    return (
      <Page title="Page Not Found" narrow={true}>
        <PageNotFound />
      </Page>
    );
  }

  // if the data isn't available yet, but the get request is in transit:
  if (!singlePostData)
    return (
      <Page title="Loading...">
        <LoadingDots />
      </Page>
    );

  function isOwner() {
    // return false if the user is not logged in --> leads to non-displaying of edit and delete btns.
    if (!globalState.userCredentials) return false;

    // return false if the user logged in is not the same as the author of the post. --> Also leads to non-displaying of edit and delete btns.
    if (globalState.userCredentials.username !== singlePostData.author.username) return false;

    return true;
  }

  // handler functions can be made directly async.
  const deleteHandler = async function (e) {
    const deletePostConfirmation = window.confirm('Do you really want to delete this post?');

    if (deletePostConfirmation) {
      // send axios req to delete post
      try {
        const serverResponse = await axios.delete(`/post/${id}`, { data: { token: globalState.userCredentials.token } }); //(api endpoint, data we wanna send)

        // check if delete request was success
        if (serverResponse.data === 'Success') {
          // 1. Display a flash message
          globalStateUpdator({ type: 'addFlashMessage', newMessage: 'Successfully deleted post' });

          // 2. Redirect back to current user's profile
          giveFlowToRouter(`/profile/${globalState.userCredentials.username}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  // if data becomes available:
  return (
    <Page title={singlePostData.title} narrow={true}>
      <div className="d-flex justify-content-between">
        <h2>{singlePostData.title}</h2>
        {/* Only if the first value is true, JSX component is returned. */}
        {isOwner() && (
          <span className="pt-2">
            <Link id="edit-button" data-tooltip-content="Edit" to={`/post/${id}/edit`} className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <Tooltip anchorId="edit-button" />
            <a onClick={deleteHandler} id="delete-button" data-tooltip-content="Delete" className="delete-post-button text-danger" title="Delete">
              <i className="fas fa-trash"></i>
            </a>
            <Tooltip anchorId="delete-button" />
          </span>
        )}
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
