import React, { useContext, useEffect, useRef } from 'react';
import { useImmer } from 'use-immer'; //like useState

import GlobalStateContext from '../contexts/state-context';
import GlobalStateUpdatorContext from '../contexts/state-updator-context';

function Chat() {
  const globalState = useContext(GlobalStateContext);
  const globalStateUpdator = useContext(GlobalStateUpdatorContext);

  const intialVal = null;
  const chatField = useRef(intialVal); //mutable | compo that are dependent won't re-render if chatField changes

  const initialLocalStateVal = {
    fieldValue: '',
    chatMessages: []
  };
  const [localState, setLocalState] = useImmer(initialLocalStateVal);

  // console.log(globalState.isChatOpen);

  // Everytime isChatOpen property is set, this runs. Also runs on the first mounting of Chat.
  useEffect(() => {
    // do nothing if the chat is not supposed to be open.
    if (!globalState.isChatOpen) return;

    // .current to access value of the element
    // we're using a useRef ref instead of using document.querySelector(...).focus()
    chatField.current.focus();
  }, [globalState.isChatOpen]);

  const handleFieldChange = function (e) {
    const latestFieldVal = e.target.value;

    setLocalState(curVal => {
      curVal.fieldValue = latestFieldVal;
    });
  };

  const handleSubmit = function (e) {
    e.preventDefault();

    // send message to chat server

    // add the message to localState.chatMessage and clear out the input field value state
    setLocalState(curVal => {
      curVal.chatMessages.push({ message: curVal.fieldValue, username: globalState.userCredentials.username, avatar: globalState.userCredentials.avatar });
      // clear out the field value after the message has been added
      curVal.fieldValue = '';
    });
  };

  return (
    <div id="chat-wrapper" className={'chat-wrapper shadow border-top border-left border-right ' + (globalState.isChatOpen ? 'chat-wrapper--is-visible' : '')}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={e => globalStateUpdator({ type: 'closeChat' })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log">
        {localState.chatMessages.map((msg, index) => {
          //we need to know which template to use, that is we need to know who sent the chat msg

          // if we sent the msg
          if (msg.username === globalState.userCredentials.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{msg.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={msg.avatar} />
              </div>
            );
          }

          // if we someone else sent the msg
          return (
            <div className="chat-other">
              <a href="#">
                <img className="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128" />
              </a>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <a href="#">
                    <strong>barksalot:</strong>
                  </a>
                  Hey, I am good, how about you?
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input ref={chatField} onChange={handleFieldChange} value={localState.fieldValue} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
}

export default Chat;
