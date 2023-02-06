import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <>
      <div className="text-center">Whoops! We cannot find that page.</div>
      <p className="lead text-muted text-center">
        You can always visit the <Link to="/">Homepage</Link> to get a fresh start!
      </p>
    </>
  );
}

export default PageNotFound;
