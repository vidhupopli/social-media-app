import React, { useEffect, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';
import axios from 'axios';

// My contexts
import GlobalStateUpdatorContext from '../contexts/state-updator-context';

function HomeGuest() {
  const globalStateUpdator = useContext(GlobalStateUpdatorContext);

  const _initialLocalState = {
    username: {
      value: '',
      hasErrors: false,
      message: '',
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: '',
      hasErrors: false,
      message: '',
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: '',
      hasErrors: false,
      message: ''
    },
    submitCount: 0
  };
  const _localStateUpdator = function (curLocalState, actionObj) {
    switch (actionObj.type) {
      // --runs immediately after something is typed into username field--
      case 'usernameImmediately':
        // Storing fiel value into localState
        curLocalState.username.hasErrors = false; //assume there is no error when username is typed

        // // only if new value has been passed, then update the state otherwise validate the currently existing username afterwards.
        // const newUsernameValPassedToActionObj = actionObj.value !== undefined;
        // if (newUsernameValPassedToActionObj) {
        curLocalState.username.value = actionObj.value;
        // }

        // Validation of total character length
        if (curLocalState.username.value.length > 10) {
          curLocalState.username.hasErrors = true;
          curLocalState.username.message = 'username cannot exceed 10 chars';
        }

        // Validation of allowed characters
        const usernameNotEmpty = curLocalState.username.value;
        const usernameNotWithInvalidChars = !/^([a-zA-Z0-9]+)$/.test(curLocalState.username.value);
        if (usernameNotEmpty && usernameNotWithInvalidChars) {
          curLocalState.username.hasErrors = true;
          curLocalState.username.message = 'username can only contain letters and nums';
        }
        break;
      // --code to run after a while username field changes--
      case 'usernameAfterDelay':
        // validate minimum username length
        const usernameLessThan3Chars = curLocalState.username.value.length < 3;
        if (usernameLessThan3Chars) {
          curLocalState.username.hasErrors = true;
          curLocalState.username.message = 'username must have more than 3 chars';
        }

        // validate unique username in the database by triggering to make axios request
        const makeReqToCheckUniqueness = !Boolean(actionObj.noRequest); //if noRequest is undefined then it is converted into false which is inverted into true. Which is what is needed to make the if clause run. Otherwise, if noRequest is true, then it is converted into true again, which is then inverted into false which is what prevents if clause from running.
        const noExistingErrors = !curLocalState.username.hasErrors;
        if (noExistingErrors && makeReqToCheckUniqueness) curLocalState.username.checkCount++;
        break;
      //--code to run after network req for checking the uniqueness of the username has been made and server has responded--
      case 'usernameUniqueResults':
        const usernameAlreadyExists = actionObj.value;
        if (usernameAlreadyExists) {
          curLocalState.username.hasErrors = true;
          curLocalState.username.isUnique = false;
          curLocalState.username.message = 'username already exists';
        } else {
          curLocalState.username.isUnique = true;
        }
        break;
      case 'emailImmediately':
        curLocalState.email.hasErrors = false;
        curLocalState.email.value = actionObj.value;

        // no validation needs to happen immediately because no one can enter a valid email immediately.
        break;
      case 'emailAfterDelay':
        // validing email formatting
        const invalidEmail = !/^\S+@\S+$/.test(curLocalState.email.value);
        if (invalidEmail) {
          curLocalState.email.hasErrors = true;
          curLocalState.email.message = 'Invalid email';
        }

        // validating uniqueness of the email as per database records, by signalling making of a network request
        const noExistingEmailErrors = !curLocalState.email.hasErrors;
        const makeReqToCheckEmailUniqueness = !Boolean(actionObj.noRequest);
        if (noExistingEmailErrors && makeReqToCheckEmailUniqueness) {
          curLocalState.email.checkCount++; //signals a useEffect that's watching to make a network request
        }
        break;
      case 'emailUniqueResults':
        const emailAlreadyExists = actionObj.value;
        if (emailAlreadyExists) {
          curLocalState.email.hasErrors = true;
          curLocalState.email.isUnique = false;
          curLocalState.email.message = 'email already exists';
        } else {
          curLocalState.email.isUnique = true;
        }
        break;
      case 'passwordImmediately':
        curLocalState.password.hasErrors = false;

        // const newPasswordValPassedToActionObj = actionObj.value !== undefined;
        // if (newPasswordValPassedToActionObj) {
        curLocalState.password.value = actionObj.value;
        // }

        // validate max password length
        const passwordExceeds15Chars = curLocalState.password.value.length > 15;
        if (passwordExceeds15Chars) {
          curLocalState.password.hasErrors = true;
          curLocalState.password.message = 'Password cannot exceed 12 chars';
        }
        break;
      case 'passwordAfterDelay':
        // validate min password length after a bit of delay
        const passwordNotAtleast12Chars = curLocalState.password.value.length < 12;
        if (passwordNotAtleast12Chars) {
          curLocalState.password.hasErrors = true;
          curLocalState.password.message = 'Password must have at least 12 chars';
        }
        break;
      case 'submitForm':
        // signal to useEffect that we wanna make a network request to signup a new user
        const noUsernameErrorsExist = !curLocalState.username.hasErrors;
        const noEmailErrorsExist = !curLocalState.email.hasErrors;
        const noPasswordErrorsExist = !curLocalState.password.hasErrors;
        const usernameIsUnique = curLocalState.username.isUnique;
        const emailIsUnique = curLocalState.email.isUnique;
        if (noUsernameErrorsExist && usernameIsUnique && noEmailErrorsExist && emailIsUnique && noPasswordErrorsExist) {
          curLocalState.submitCount++;
        }
        break;
      default:
        throw new Error('Invalid type specified');
    }
  };
  const [localState, localStateUpdator] = useImmerReducer(_localStateUpdator, _initialLocalState);

  //-----------------------------------------------
  // useEffects for the username field validation
  //-----------------------------------------------
  // upon changing of username field, signal running of validation code after a bit of delay | runs when HomeGuest is first mounted and when username field changes
  useEffect(() => {
    // basically to do nothing the first time this useEffect runs
    if (!localState.username.value) return;

    const delayTimeoutRef = setTimeout(() => localStateUpdator({ type: 'usernameAfterDelay' }), 800);

    // getting rid of previously created timeout when the username changes again | useEffect's cleanup function which runs the next time this useEffect runs OR when this HomeGuest compo is unmounted.
    return () => clearTimeout(delayTimeoutRef);
  }, [localState.username.value]);

  // upon changing of username field (after a bit of delay), make network request to check if the username already exists | runs when HomeGuest is first mounted and when localState.username.checkCount changes.
  useEffect(() => {
    // Do nothing if this is the first time the useEffect has been run.
    if (!localState.username.checkCount) return;

    const axiosReqRef = axios.CancelToken.source();
    // Make network request:
    (async function () {
      try {
        const url = '/doesUsernameExist';
        const dataToSend = { username: localState.username.value };
        const cancelToken = { cancelToken: axiosReqRef.token };
        const serverResponse = await axios.post(url, dataToSend, cancelToken); //server is going to respond with a boolean data prop

        localStateUpdator({ type: 'usernameUniqueResults', value: serverResponse.data });
      } catch (err) {
        console.log(err);
      }
    })();

    // return cleanup function
    return () => axiosReqRef.cancel();
  }, [localState.username.checkCount]);
  //----------------------------------------------

  //-----------------------------------------------
  // useEffects for the email field validation
  //-----------------------------------------------
  // upon changing of email field, signal running of validation code after a bit of delay | runs when HomeGuest is first mounted and when username field changes
  useEffect(() => {
    // basically to do nothing the first time this useEffect runs
    const emailDoesntExist = !localState.email.value;
    if (emailDoesntExist) return;

    const delayTimeoutRef = setTimeout(() => localStateUpdator({ type: 'emailAfterDelay' }), 800);

    // getting rid of previously created timeout when the email changes again | useEffect's cleanup function which runs the next time this useEffect runs OR when this HomeGuest compo is unmounted.
    return () => clearTimeout(delayTimeoutRef);
  }, [localState.email.value]);

  // upon changing of email field (after a bit of delay), make network request to check if the email already exists | runs when HomeGuest is first mounted and when localState.email.checkCount changes.
  useEffect(() => {
    // Do nothing if this is the first time the useEffect has been run.
    const makeNoReqToCheckEmailUniqueness = localState.email.checkCount === 0;
    if (makeNoReqToCheckEmailUniqueness) return;

    const axiosReqRef = axios.CancelToken.source();
    // Make network request:
    (async function () {
      try {
        const url = '/doesEmailExist';
        const dataToSend = { email: localState.email.value };
        const cancelToken = { cancelToken: axiosReqRef.token };
        const serverResponse = await axios.post(url, dataToSend, cancelToken); //server is going to respond with a boolean data prop

        localStateUpdator({ type: 'emailUniqueResults', value: serverResponse.data });
      } catch (err) {
        console.log(err);
      }
    })();

    // return cleanup function
    return () => axiosReqRef.cancel();
  }, [localState.email.checkCount]);
  //----------------------------------------------

  //-----------------------------------------------
  // useEffects for the password field validation
  //-----------------------------------------------
  // upon changing of password field, signal running of validation code after a bit of delay | runs when HomeGuest is first mounted and when username field changes
  useEffect(() => {
    // basically to do nothing the first time this useEffect runs
    const passwordDoesntExist = !localState.password.value;
    if (passwordDoesntExist) return;

    const delayTimeoutRef = setTimeout(() => localStateUpdator({ type: 'passwordAfterDelay' }), 800);

    // getting rid of previously created timeout when the password changes again | useEffect's cleanup function which runs the next time this useEffect runs OR when this HomeGuest compo is unmounted.
    return () => clearTimeout(delayTimeoutRef);
  }, [localState.password.value]);
  //----------------------------------------------

  //-----------------------------------------------
  // useEffects for submitting the form upon receving signal
  //-----------------------------------------------
  useEffect(() => {
    // do nothing the first time this useEffect runs
    const dontSendSignupRequest = localState.submitCount === 0;
    if (dontSendSignupRequest) return;

    // Make network request to signup user:
    const axiosReqRef = axios.CancelToken.source();
    (async function () {
      try {
        const url = '/register';
        const dataToSend = { username: localState.username.value, email: localState.email.value, password: localState.password.value };
        const cancelToken = { cancelToken: axiosReqRef.token };
        const serverResponse = await axios.post(url, dataToSend, cancelToken); //server is going to respond with a boolean data prop

        console.log(serverResponse.data);

        // Automaticlly log the user in by just updating the userCredentials state | this line runs only if there is a successful registeration of the user
        globalStateUpdator({ type: 'login', data: serverResponse.data });
        globalStateUpdator({ type: 'addFlashMessage', newMessage: 'welcome to your new account' });
      } catch (err) {
        console.log(err);
      }
    })();

    // return cleanup function
    return () => axiosReqRef.cancel();
  }, [localState.submitCount]);
  //-----------------------------------------------

  const handleSubmit = function (e) {
    e.preventDefault();

    // run all the validation rules before making network req to submit form
    localStateUpdator({ type: 'usernameImmediately', value: localState.username.value });
    localStateUpdator({ type: 'usernameAfterDelay', noRequest: true }); //dont wanna make network req to check username uniqueness before submitting form
    localStateUpdator({ type: 'emailImmediately', value: localState.email.value });
    localStateUpdator({ type: 'emailAfterDelay', noRequest: true }); // dont wanna make network req to check email uniqueness before submitting form
    localStateUpdator({ type: 'passwordImmediately', value: localState.password.value });
    localStateUpdator({ type: 'passwordAfterDelay' });

    //signal making of the network request
    localStateUpdator({ type: 'submitForm' });
  };

  return (
    <div className="row align-items-center">
      <div className="col-lg-7 py-3 py-md-5">
        <h1 className="display-3">Remember Writing?</h1>
        <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
      </div>
      <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username-register" className="text-muted mb-1">
              <small>Username</small>
            </label>
            <input onChange={e => localStateUpdator({ type: 'usernameImmediately', value: e.target.value })} value={localState.username.value} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
            {/* in={booleanValue} which determines when the div would exist, timeout=miliseconds, classNames=as per spec, */}
            <CSSTransition in={localState.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
              <div className="alert alert-danger small liveValidateMessage">{localState.username.message}</div>
            </CSSTransition>
          </div>
          <div className="form-group">
            <label htmlFor="email-register" className="text-muted mb-1">
              <small>Email</small>
            </label>
            <input onChange={e => localStateUpdator({ type: 'emailImmediately', value: e.target.value })} value={localState.email.value} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
            <CSSTransition in={localState.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
              <div className="alert alert-danger small liveValidateMessage">{localState.email.message}</div>
            </CSSTransition>
          </div>
          <div className="form-group">
            <label htmlFor="password-register" className="text-muted mb-1">
              <small>Password</small>
            </label>
            <input onChange={e => localStateUpdator({ type: 'passwordImmediately', value: e.target.value })} value={localState.password.value} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
            <CSSTransition in={localState.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
              <div className="alert alert-danger small liveValidateMessage">{localState.password.message}</div>
            </CSSTransition>
          </div>
          <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
            Sign up for ComplexApp
          </button>
        </form>
      </div>
    </div>
  );
}

export default HomeGuest;
