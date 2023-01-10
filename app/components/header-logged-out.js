import React, { useState } from 'react';
import axios from 'axios';

function HeaderLoggedOut(props) {
  // states for input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const userLoginHandler = async function (e) {
    e.preventDefault();
    try {
      const serverResponse = await axios.post('/login', { username, password });

      // if login unsuccessful alert and don't proceed further
      if (!serverResponse.data) return alert('X -> failed login');

      // store obtained user data in state
      props.setUserCredentials(serverResponse.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={userLoginHandler} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setUsername(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
