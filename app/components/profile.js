import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useImmer } from 'use-immer';
import axios from 'axios';

// my context
import GlobalStateContext from '../contexts/state-context';

// my components
import Page from './page';
import ProfilePosts from './profile-posts';

function Profile() {
  const { username } = useParams();
  const globalState = useContext(GlobalStateContext);

  const initialValue = {
    profileData: {
      profileUsername: '...',
      profileAvatar: '	https://gravatar.com/avatar/460c63a5312e0d71ab158836abb9d281?s=128',
      isFollowing: false,
      counts: {
        postCount: '...',
        followerCount: '...',
        followingCount: '...'
      }
    },
    // props needed to make follow feature work
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0
  };
  const [localState, setLocalState] = useImmer(initialValue);

  // guideline: do not put the async function outside of the useEffect

  // obtain profile data | running arrowFn when this compo is mounted, and also when the url id changes. The latter helps solve a bug.
  useEffect(() => {
    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        const loggedInUserData = JSON.parse(localStorage.getItem('persistedUserData'));

        const serverResponse = await axios.post(`/profile/${username}`, { token: loggedInUserData.token }, { cancelToken: axiosRequestRef.token });

        setLocalState(curVal => {
          curVal.profileData = serverResponse.data;
        });
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosRequestRef.cancel();
  }, [username]);

  // to make the follow network request | arrowFn runs when the compo is mounted and when the respective localstate property changes
  useEffect(() => {
    // Make sure that no network req is made when this <Profile /> compo is loaded for the first time.
    if (!localState.startFollowingRequestCount) return;

    setLocalState(curVal => {
      curVal.followActionLoading = true;
    });

    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        await axios.post(`/addFollow/${localState.profileData.profileUsername}`, { token: globalState?.userCredentials?.token }, { cancelToken: axiosRequestRef.token });

        setLocalState(curVal => {
          curVal.profileData.isFollowing = true;
          curVal.profileData.counts.followerCount++;
          curVal.followActionLoading = false;
        });
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosRequestRef.cancel();
  }, [localState.startFollowingRequestCount]);

  // to make the UNFOLLOW network request | arrowFn runs when the compo is mounted and when the respective localstate property changes
  useEffect(() => {
    // Make sure that no network req is made when this <Profile /> compo is loaded for the first time.
    if (!localState.stopFollowingRequestCount) return;

    setLocalState(curVal => {
      curVal.followActionLoading = true;
    });

    const axiosRequestRef = axios.CancelToken.source();

    (async function () {
      try {
        await axios.post(`/removeFollow/${localState.profileData.profileUsername}`, { token: globalState?.userCredentials?.token }, { cancelToken: axiosRequestRef.token });

        setLocalState(curVal => {
          curVal.profileData.isFollowing = false;
          curVal.profileData.counts.followerCount--;
          curVal.followActionLoading = false;
        });
      } catch (err) {
        console.log(err);
      }
    })();

    return () => axiosRequestRef.cancel();
  }, [localState.stopFollowingRequestCount]);

  const handleFollowBtnPress = function (e) {
    // Signal following request
    setLocalState(curVal => {
      curVal.startFollowingRequestCount++;
    });
  };

  const handleUnfollowBtnPress = function (e) {
    // Signal following request
    setLocalState(curVal => {
      curVal.stopFollowingRequestCount++;
    });
  };

  return (
    <Page title="My Posts" narrow={true}>
      <h2>
        <img className="avatar-small" src={localState.profileData.profileAvatar} /> {localState.profileData.profileUsername}
        {/* Display this button only if you're logged in, if the logged in user is not currently following the user whose profile is being visited, if the logged in user is not the same is visited user, if there actually is some profile data loaded */}
        {globalState.userCredentials && !localState.profileData.isFollowing && globalState.userCredentials.username !== localState.profileData.profileUsername && localState.profileData.profileUsername !== '...' && (
          // disabled property/attr works by specifying a bool value. if false, then the component is colored out and disabled from pointer events.
          <button onClick={handleFollowBtnPress} disabled={localState.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {globalState.userCredentials && localState.profileData.isFollowing && globalState.userCredentials.username !== localState.profileData.profileUsername && localState.profileData.profileUsername !== '...' && (
          // disabled property/attr works by specifying a bool value. if false, then the component is colored out and disabled from pointer events.
          <button onClick={handleUnfollowBtnPress} disabled={localState.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Follow <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {localState.profileData.counts.postCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {localState.profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {localState.profileData.counts.followingCount}
        </a>
      </div>

      <ProfilePosts />
    </Page>
  );
}

export default Profile;
