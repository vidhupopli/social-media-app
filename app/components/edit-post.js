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
  const globalState = useContext(StateContext);
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
    // dataReceivedFromServer: false,
    // postUpdated: false,
    axiosEditPostReqCount: 0,
    userReqForEdit: false
  };
  const updateLocalStateReducer = function (curMutableStateValue, situationObj) {
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
      case 'newEditPostReq':
        curMutableStateValue.axiosEditPostReqCount++;
        break;
      case 'userMadeRequestToEditPost':
        // if there's an error, mark it
        if (curMutableStateValue.title.value === '') {
          curMutableStateValue.title.hasErrors = true;
        } else {
          // if there was error earlier, we need to ensure that it has been marked as removed
          curMutableStateValue.title.hasErrors = false;
        }

        // if there's an error, mark it
        if (curMutableStateValue.body.value === '') {
          curMutableStateValue.body.hasErrors = true;
        } else {
          // if there was error earlier, we need to ensure that it has been marked as removed
          curMutableStateValue.body.hasErrors = false;
        }

        // don't initiate a post request if either of the fields have errors
        if (curMutableStateValue.title.hasErrors || curMutableStateValue.body.hasErrors) return;

        curMutableStateValue.userReqForEdit = true;

        break;
      case 'noPendingUserReqToEdit':
        curMutableStateValue.userReqForEdit = false;
        break;
    }
  };
  const [localState, localStateUpdator] = useImmerReducer(updateLocalStateReducer, initialStateValue);

  // initiates in the bg when the component first loads in the bg. Get request to obtain existing post details is being made here.
  useEffect(() => {
    const axiosReqRef = axios.CancelToken.source();

    (async function () {
      try {
        // obtain post data from server
        const serverResponse = await axios.get(`/post/${localState.id}`, { cancelToken: axiosReqRef.token });

        // data has been recd, and input fields values are available: update state to reflect this
        localStateUpdator({ name: 'serverSentPostData', postData: serverResponse.data });
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosReqRef.cancel();
  }, []);

  /////////////
  // 📝 OVERVIEW OF WHAT IS HAPPENING BELOW:
  /////////////
  // 1. onSubmitHandler is being used to update a state value to signal a post request
  // 2. useEffect that is watching for that state is used to make the network request
  // 3. weird adherence to the notion that useEffects are right places to send network requests from. Why not just send network request from the the editPost handler?
  //1 -------------------->
  const editPostHandler = async function (e) {
    e.preventDefault();

    // Marks error states and if no error, user req state as true
    localStateUpdator({ name: 'userMadeRequestToEditPost' });

    localStateUpdator({ name: 'newEditPostReq' });
  };
  //2 -------------------->
  useEffect(() => {
    // this conditional is just to ensure that this useEffect doesn't run the first time 'EditPost' is mounted.
    if (localState.axiosEditPostReqCount === 0) return;

    // only if user request has been recorded has initiated, proceed further. Otherwise don't do anything.
    if (!localState.userReqForEdit) return;

    // generate ref to attach to post req subsiquently made
    const axiosReqRef = axios.CancelToken.source();

    // make edit post request, and do other things if successful
    (async function () {
      try {
        // send the request for editing the form over here
        await axios.post(`/post/${localState.id}/edit`, { title: localState.title.value, body: localState.body.value, token: globalState.userCredentials.token }, { cancelToken: axiosReqRef.token });
        // alert('database edited!');

        // please enable the button now
        localStateUpdator({ name: 'noPendingUserReqToEdit' });

        // after the post has been edited, update flash message state
        // this leads to re-rendering of a component that's outside of the router
        globalStateUpdator({ type: 'addFlashMessage', newMessage: 'Succssfully edited post!' });

        // after the form has been successfully edited unmount this component and mount the single post component via the router
        // giveFlowToRouterFor(`/post/${localState.id}`);
      } catch (err) {
        console.log(err);
      }
    })();

    // use req reference to reject the request promise IF this 'EditPost' component is unmounted while the the promise is pending.
    return () => axiosReqRef.cancel();
  }, [localState.axiosEditPostReqCount]);

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
          {/* alert ui component based on localstate */}
          <div className={'validation-alert-box' + (localState.title.hasErrors ? '' : '--hide')}>
            <p className="validation-alert-text">Field cannot be empty</p>
          </div>
          <input onChange={e => localStateUpdator({ name: 'titleChange', newValue: e.target.value })} value={localState.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          {/* alert ui component based on localstate */}
          <div className={'validation-alert-box' + (localState.body.hasErrors ? '' : '--hide')}>
            <p className="validation-alert-text">Field cannot be empty</p>
          </div>
          <textarea onChange={e => localStateUpdator({ name: 'bodyChange', newValue: e.target.value })} value={localState.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary" disabled={localState.userReqForEdit}>
          Update Post
        </button>
      </form>
    </Page>
  );
}

export default EditPost;
