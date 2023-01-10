import React from 'react';

function FlashMessages(props) {
  return (
    <div className="floating-alerts">
      {props.flashMessagesState.map((msg, index) => (
        <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
          {msg}
        </div>
      ))}
    </div>
  );
}

export default FlashMessages;
