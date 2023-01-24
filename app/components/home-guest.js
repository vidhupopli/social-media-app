import React from 'react';
import { useImmerReducer } from 'use-immer';

function HomeGuest() {
  const _initialLocalState = {
    username: {
      value: '',
      hasErrors: '',
      message: '',
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: '',
      hasErrors: '',
      message: '',
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: '',
      hasErrors: '',
      message: ''
    },
    submitCount: 0
  };
  const _localStateUpdator = function (curLocalState, actionObj) {
    switch (actionObj.type) {
      case 'usernameImmediately':
        curLocalState.username.hasErrors = false; //assume there is no error when username is typed
        curLocalState.username.value = actionObj.value;
        break;
      case 'usernameAfterDelay':
        break;
      case 'usernameUniqueResults':
        break;
      case 'emailImmediately':
        curLocalState.email.hasErrors = false;
        curLocalState.email.value = actionObj.value;
        break;
      case 'emailAfterDelay':
        break;
      case 'emailUniqueResults':
        break;
      case 'passwordImmediately':
        curLocalState.password.hasErrors = false;
        curLocalState.password.value = actionObj.value;
        break;
      case 'passwordAfterDelay':
        break;
      case 'submitForm':
        break;
      default:
        throw new Error('Invalid type specified');
    }
  };
  const [localState, localStateUpdator] = useImmerReducer(_localStateUpdator, _initialLocalState);

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
          </div>
          <div className="form-group">
            <label htmlFor="email-register" className="text-muted mb-1">
              <small>Email</small>
            </label>
            <input onChange={e => localStateUpdator({ type: 'emailImmediately', value: e.target.value })} value={localState.email.value} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="password-register" className="text-muted mb-1">
              <small>Password</small>
            </label>
            <input onChange={e => localStateUpdator({ type: 'passwordImmediately', value: e.target.value })} value={localState.password.value} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
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
