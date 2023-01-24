import React, { useEffect } from 'react';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';
import axios from 'axios';

function HomeGuest() {
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
        curLocalState.username.value = actionObj.value;

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
        const noExistingErrors = !curLocalState.username.hasErrors;
        if (noExistingErrors) curLocalState.username.checkCount++;
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
        if (noExistingEmailErrors) {
          curLocalState.email.checkCount++; //this is what signals a useEffect that's watching to make a network request
        }
        break;
      case 'emailUniqueResults':
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
        curLocalState.password.value = actionObj.value;

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

  const handleSubmit = function (e) {
    e.preventDefault();
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
