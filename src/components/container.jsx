import React from 'react';

function Container(props) {
  // children property is automatically passed to this component at the time of calling it
  return <div className={'container py-md-5 ' + (props.narrow ? 'container--narrow' : '')}>{props.children}</div>;
}

export default Container;
