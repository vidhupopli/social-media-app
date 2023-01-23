import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// my context
import StateContext from '../contexts/state-context';

// my components
import Page from './page';
import ProfilePosts from './profile-posts';

function Profile() {
  const { username } = useParams();
  const stateRef = useContext(StateContext);

  const [profileData, setProfileData] = useState({
    profileUsername: '...',
    profileAvatar: '	https://gravatar.com/avatar/460c63a5312e0d71ab158836abb9d281?s=128',
    isFollowing: false,
    counts: {
      postCount: '...',
      followerCount: '...',
      followingCount: '...'
    }
  });

  // guideline: do not put the async function outside of the useEffect

  // running arrowFn when this compo is mounted, and also when the url id changes. The latter helps solve a bug.
  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        const serverResponse = await axios.post(`/profile/${username}`, { token: stateRef?.userCredentials?.token }, { cancelToken: axiosRequestRef.token });

        setProfileData(serverResponse.data);
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosRequestRef.cancel();
  }, [username]);

  return (
    <Page title="My Posts" narrow={true}>
      <h2>
        <img className="avatar-small" src={profileData.profileAvatar} /> {profileData.profileUsername}
        <button className="btn btn-primary btn-sm ml-2">
          Follow <i className="fas fa-user-plus"></i>
        </button>
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {profileData.counts.postCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {profileData.counts.followingCount}
        </a>
      </div>
      <ProfilePosts />
    </Page>
  );
}

export default Profile;
