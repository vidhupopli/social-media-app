import React, { useContext } from 'react';

// my context references
import StateContext from '../contexts/state-context';

function FlashMessages() {
  // retrieving data out of a context
  const retrievedStateRef = useContext(StateContext);

  return (
    <div className="floating-alerts">
      {retrievedStateRef.flashMessages.map((msg, index) => (
        <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
          {msg}
        </div>
      ))}
    </div>
  );
}

export default FlashMessages;
