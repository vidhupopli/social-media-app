// We wanna use the useContext hook in order to retrieve data from a context
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// my components
import Page from './page';

// my context
// context reference is required in order to retrieve data from it
import ExampleContext from '../contexts/example-context';

function CreatePost() {
  // retrieving data out of a context
  const { userCredentials, addFlashMessageToState } = useContext(ExampleContext);

  // states for the input and textarea elements
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const navigate = useNavigate();

  // utility function to clear title and body state
  const emptyTitleAndBodyStates = () => {
    setTitle('');
    setBody('');
  };

  const postCreationHandler = async function (e) {
    e.preventDefault();
    try {
      const dataToSend = {
        title,
        body,
        token: userCredentials.token
      };

      const serverResponse = await axios.post('/create-post', dataToSend);
      const postId = serverResponse.data;

      emptyTitleAndBodyStates();

      // using data of a context
      addFlashMessageToState('New Post Created!');

      navigate(`/post/${postId}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Page title="New Post" narrow={true}>
      <form onSubmit={postCreationHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
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

export default CreatePost;
