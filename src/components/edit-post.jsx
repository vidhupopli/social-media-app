import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useImmerReducer } from 'use-immer';

// my contexts
import StateUpdatorContext from '../contexts/state-updator-context';
import StateContext from '../contexts/state-context';

// my components
import Page from './page';
import LoadingDots from './loading-dots';
import PageNotFound from './page-not-found';

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
    axiosEditPostReqCount: 0,
    disableButtonForEditing: false,
    dataReceivedFromServer: false,
    postNotFound: false
  };
  const updateLocalStateReducer = function (curMutableStateValue, situationObj) {
    switch (situationObj.name) {
      case 'postHasNotBeenFound':
        curMutableStateValue.postNotFound = true;
        break;
      case 'serverSentPostData':
        curMutableStateValue.dataReceivedFromServer = true;
        curMutableStateValue.title.value = situationObj.postData.title;
        curMutableStateValue.body.value = situationObj.postData.body;
        break; //can also write return. Because ultimately this function is anyway returning return undefined.
      case 'titleBeingTyped':
        //if title is being typed then there is no erorr of empty title
        curMutableStateValue.title.hasErrors = false;
        curMutableStateValue.title.value = situationObj.newValue;
        break;
      case 'bodyBeingTyped':
        curMutableStateValue.body.hasErrors = false;
        curMutableStateValue.body.value = situationObj.newValue;
        break;
      case 'newEditPostReq':
        if (curMutableStateValue.title.hasErrors || curMutableStateValue.body.hasErrors) return;

        curMutableStateValue.axiosEditPostReqCount++;

        curMutableStateValue.disableButtonForEditing = true;
        break;
      case 'postReqComplete':
        curMutableStateValue.disableButtonForEditing = false;
        break;
      case 'validateTitleInputField':
        // It seems a little bit safer to pass the value of the input field to the dispatch object because we don't know the order of the callbacks for the onChange and onBlur will execute>
        // if (curMutableStateValue.title.value) {
        if (situationObj.valueOfTitle.trim() === '') {
          //trim is so that empty space characters are removed.
          curMutableStateValue.title.hasErrors = true;
          curMutableStateValue.title.message = 'Please provide a title';
        } else {
          curMutableStateValue.title.hasErrors = false;
          curMutableStateValue.title.message = '';
        }
        break;
      case 'validateBodyInputField':
        if (situationObj.valueOfBody.trim() === '') {
          curMutableStateValue.body.hasErrors = true;
          curMutableStateValue.body.message = 'Please provide a body for the post';
        } else {
          curMutableStateValue.body.hasErrors = false;
          curMutableStateValue.body.message = '';
        }
        break;
      default:
        throw new Error('Invalid way to update the local state');
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

        if (!serverResponse.data) {
          localStateUpdator({ name: 'postHasNotBeenFound' });
          return;
        }

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

    // form validation is being done onSubmit. (As it is being done onBlur)
    localStateUpdator({ name: 'validateTitleInputField', valueOfTitle: localState.title.value });
    localStateUpdator({ name: 'validateBodyInputField', valueOfBody: localState.body.value });

    // this triggers the axios post request, but will only happen if there was no error in the input fields as per the previous logic.
    localStateUpdator({ name: 'newEditPostReq' });
  };
  //2 -------------------->
  useEffect(() => {
    // this conditional is just to ensure that this useEffect doesn't run the first time 'EditPost' is mounted.
    if (localState.axiosEditPostReqCount === 0) return;

    // generate ref to attach to post req subsiquently made
    const axiosReqRef = axios.CancelToken.source();

    // make edit post request, and do other things if successful
    (async function () {
      try {
        // send the request for editing the form over here
        await axios.post(`/post/${localState.id}/edit`, { title: localState.title.value, body: localState.body.value, token: globalState.userCredentials.token }, { cancelToken: axiosReqRef.token });
        // alert('database edited!');

        // enables the button back for futher editing
        localStateUpdator({ name: 'postReqComplete' });

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

  // if the get request returns no data.
  if (localState.postNotFound) {
    return (
      <Page title="Page Not Found" narrow={true}>
        <PageNotFound />
      </Page>
    );
  }

  // jsx to return if the data has NOT been recd yet but might be. Basically the post request hasn't been fulfilled yet.
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
      <Link to={`/post/${localState.id}`} className="small font-weight-bold">
        &laquo; Back to post
      </Link>
      <form onSubmit={editPostHandler} className="mt-3">
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          {/* alert ui component before input field based on localstate */}
          <div className={'validation-alert-box' + (localState.title.hasErrors ? '' : '--hide')}>
            <p className="validation-alert-text">{localState.title.message}</p>
          </div>
          {/* upon unfocussing of this element, update the localstate to determine whether error exist or not for this input field. */}
          <input onBlur={e => localStateUpdator({ name: 'validateTitleInputField', valueOfTitle: e.target.value })} onChange={e => localStateUpdator({ name: 'titleBeingTyped', newValue: e.target.value })} value={localState.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          {/* alert ui component based on localstate */}
          {localState.body.hasErrors && (
            <div className="validation-alert-box">
              <p className="validation-alert-text">{localState.body.message}</p>
            </div>
          )}
          <textarea onBlur={e => localStateUpdator({ name: 'validateBodyInputField', valueOfBody: e.target.value })} onChange={e => localStateUpdator({ name: 'bodyBeingTyped', newValue: e.target.value })} value={localState.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary" disabled={localState.disableButtonForEditing}>
          Update Post
        </button>
      </form>
    </Page>
  );
}

export default EditPost;
