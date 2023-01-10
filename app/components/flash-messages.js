import React, { useContext } from 'react';

// my context references
import ExampleContext from '../contexts/example-context';

function FlashMessages() {
  // retrieving data out of a context
  const { flashMessagesState } = useContext(ExampleContext);

  return (
    <div className="floating-alerts">
      {flashMessagesState.map((msg, index) => (
        <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
          {msg}
        </div>
      ))}
    </div>
  );
}

export default FlashMessages;
