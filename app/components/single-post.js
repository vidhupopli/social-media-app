import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// my components
import Page from './page';

function SinglePost() {
  const { id } = useParams();

  const [singlePostData, setSinglePostData] = useState(null);

  useEffect(() => {
    (async function () {
      try {
        const serverResponse = await axios.get(`/post/${id}`);

        setSinglePostData(serverResponse.data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  if (!singlePostData) return <p>Loading...</p>;

  return (
    <Page title={singlePostData.title} narrow={true}>
      <div className="d-flex justify-content-between">
        <h2>{singlePostData.title}</h2>
        <span className="pt-2">
          <a href="#" className="text-primary mr-2" title="Edit">
            <i className="fas fa-edit"></i>
          </a>
          <a className="delete-post-button text-danger" title="Delete">
            <i className="fas fa-trash"></i>
          </a>
        </span>
      </div>

      <p className="text-muted small mb-4">
        <a href="#">
          <img className="avatar-tiny" src={singlePostData.author.avatar} />
        </a>
        Posted by <a href="#">{singlePostData.author.username}</a> on {new Date(singlePostData.createdDate).toDateString()}
      </p>

      <div className="body-content">
        <p>{singlePostData.body}</p>
      </div>
    </Page>
  );
}

export default SinglePost;
