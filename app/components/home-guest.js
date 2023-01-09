import React, { useState } from 'react';
import Page from './page';
import axios from 'axios';

function HomeGuest() {
  // states for input fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //utility function to reset input fields states
  const resetInputStates = () => {
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const userSignupHandler = async function (e) {
    e.preventDefault();
    try {
      const userCredentialsForRegisteraion = { username, email, password };

      await axios.post('http://localhost:8080/register', userCredentialsForRegisteraion);

      resetInputStates();

      alert('user created!');
    } catch (err) {
      console.log(err.response.data);
    }
  };

  return (
    <Page title="Home | SocialApp" narrow={false}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing???</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={userSignupHandler}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => setUsername(e.target.value)} value={username} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => setEmail(e.target.value)} value={email} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => setPassword(e.target.value)} value={password} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for SocialApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
