import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// my contexts
import StateUpdatorContext from '../contexts/state-updator-context';
import StateContext from '../contexts/state-context';

// my components
import Page from './page';

function EditPost() {
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const stateUpdatorFn = useContext(StateUpdatorContext);
  const state = useContext(StateContext);

  const giveFlowToRouterFor = useNavigate();

  // initiates in the bg when the component first loads in the bg
  useEffect(() => {
    (async function () {
      try {
        // obtain post data from server
        const serverResponse = await axios.get(`/post/${id}`);

        // update state for the input fields
        setTitle(serverResponse.data.title);
        setBody(serverResponse.data.body);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const editPostHandler = async function (e) {
    e.preventDefault();
    try {
      // send the request for editing the form over here
      await axios.post(`/post/${id}/edit`, { title, body, token: state.userCredentials.token });
      // alert('database edited!');

      // after the post has been edited, update message state
      // this leads to re-rendering of a component that's outside of the router
      stateUpdatorFn({ type: 'addFlashMessage', newMessage: 'Succssfully edited post!' });

      // after the form has been successfully edited unmount this component and mount the single post component via the router
      giveFlowToRouterFor(`/post/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  // remember the returning happens immediately and the useEffect works in the bg meanwhile
  return (
    <Page title="Edit" narrow={true}>
      <form onSubmit={editPostHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          {/* the value of the title input field depends on a state, however, we make it editable by having this handler function */}
          <input value={title} onChange={e => setTitle(e.target.value)} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea value={body} onChange={e => setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  );
}

export default EditPost;
