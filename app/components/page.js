import React, { useEffect } from 'react';
import Container from './container';

function Page(props) {
  // Works because everytime different route is linked to, this component is mounted or unmounted. Mounting a component is like rendering it for the first time.
  useEffect(() => {
    document.title = `${props.title} | Social App`;
    window.scrollTo(0, 0);
  }, []);

  return <Container narrow={props.narrow}>{props.children}</Container>;
}

export default Page;
