import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Post(props) {
  return (
    <Link onClick={props.onClickHandlerValue} to={`/post/${props.post._id}`} className="list-group-item list-group-item-action">
      <img className="avatar-tiny" src={props.post.author.avatar} /> <strong>{props.post.title}</strong>{' '}
      <span className="text-muted small">
        {props.noAuthor ? '' : <>by {props.post.author.username}</>} on {new Date(props.post.createdDate).toLocaleDateString()}
      </span>
    </Link>
  );
}

export default Post;
