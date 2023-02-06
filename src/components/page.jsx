import React, { useEffect } from 'react';
import Container from './container';

function Page(props) {
  useEffect(() => {
    document.title = `${props.title} | Social App`;
    window.scrollTo(0, 0);
  }, [props.title]); // without watching for the props.title, the page title doesn't change

  return <Container narrow={props.narrow}>{props.children}</Container>;
}

export default Page;
