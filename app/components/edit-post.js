import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useImmerReducer } from 'use-immer';

// my contexts
import StateUpdatorContext from '../contexts/state-updator-context';
import StateContext from '../contexts/state-context';

// my components
import Page from './page';
import LoadingDots from './loading-dots';

function EditPost() {
  const globalStateUpdator = useContext(StateUpdatorContext);
  const state = useContext(StateContext);
  const giveFlowToRouterFor = useNavigate();

  // state for the input fields, id-data required to obtain post details, etc.
  const initialStateValue = {
    title: {
      value: '',
      hasErrors: false,
      message: ''
    },
    body: {
      value: '',
      hasErrors: false,
      message: ''
    },
    id: useParams().id,
    dataReceivedFromServer: false,
    postUpdated: false,
    axiousReqCount: 0
  };
  const updateState = function (curMutableStateValue, situationObj) {
    switch (situationObj.name) {
      case 'serverSentPostData':
        curMutableStateValue.dataReceivedFromServer = true;
        curMutableStateValue.title.value = situationObj.postData.title;
        curMutableStateValue.body.value = situationObj.postData.body;
        break; //can also write return. Because ultimately this function is anyway returning return undefined.
      case 'titleChange':
        curMutableStateValue.title.value = situationObj.newValue;
        break;
      case 'bodyChange':
        curMutableStateValue.body.value = situationObj.newValue;
        break;
    }
  };
  const [localState, updateStateWrapper] = useImmerReducer(updateState, initialStateValue);

  // initiates in the bg when the component first loads in the bg. Get request to obtain existing post details is being made here.
  useEffect(() => {
    (async function () {
      try {
        // obtain post data from server
        const serverResponse = await axios.get(`/post/${localState.id}`);

        // data has been recd, and input fields values are available: update state to reflect this
        updateStateWrapper({ name: 'serverSentPostData', postData: serverResponse.data });
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  /////////////
  // 📝 OVERVIEW OF WHAT IS HAPPENING BELOW:
  /////////////
  // 1. onSubmitHandler is being used to update a state value to signal a post request
  // 2. useEffect that is watching for that state is used to make the network request
  // 3. weird adherence to the notion that useEffects are right places to send network requests from. Why not just send network request from the the editPost handler as commented down below?

  const editPostHandler = async function (e) {
    e.preventDefault();
    try {
      // send the request for editing the form over here
      await axios.post(`/post/${localState.id}/edit`, { title: localState.title.value, body: localState.body.value, token: state.userCredentials.token });
      // alert('database edited!');

      // after the post has been edited, update message state
      // this leads to re-rendering of a component that's outside of the router
      globalStateUpdator({ type: 'addFlashMessage', newMessage: 'Succssfully edited post!' });

      // after the form has been successfully edited unmount this component and mount the single post component via the router
      giveFlowToRouterFor(`/post/${localState.id}`);
    } catch (err) {
      console.log(err);
    }
  };

  // jsx to return if the data has NOT been recd
  if (!localState.dataReceivedFromServer) {
    return (
      <Page title="Loading..." narrow={true}>
        <LoadingDots />
      </Page>
    );
  }

  // jsx to return if the data has been recd
  return (
    <Page title="Edit" narrow={true}>
      <form onSubmit={editPostHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e => updateStateWrapper({ name: 'titleChange', newValue: e.target.value })} value={localState.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e => updateStateWrapper({ name: 'bodyChange', newValue: e.target.value })} value={localState.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary">Update Post</button>
      </form>
    </Page>
  );
}

export default EditPost;
