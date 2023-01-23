import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useImmer } from 'use-immer'; //like useState

// We install this package and import this function.
import { io } from 'socket.io-client';
// establish ongoing connection between browser and server
const socket = io('http://localhost:8080');

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

  // Everytime isChatOpen property is set, this runs. Also runs on the first mounting of Chat.
  useEffect(() => {
    // do nothing if the chat is not supposed to be open.
    if (!globalState.isChatOpen) return;

    // .current to access value of the element
    // we're using a useRef ref instead of using document.querySelector(...).focus()
    chatField.current.focus();
  }, [globalState.isChatOpen]);

  // listening for a particular type of data sent by server indefinitely | runs the first time the compo is mounted
  useEffect(() => {
    // in the bg, we will have a listner listerning for this particular type of data that the server may sent to us. if it is sent we store it in localstate.
    // (typeOfEventServerBroadcastedToUsThatWeAReInterestedIn, functionThatRunsWhenServerSendsUsThisTypeOfData)
    socket.on('chatFromServer', message => {
      setLocalState(curVal => {
        curVal.chatMessages.push(message);
      });
    });
  }, []);

  const handleFieldChange = function (e) {
    const latestFieldVal = e.target.value;

    setLocalState(curVal => {
      curVal.fieldValue = latestFieldVal;
    });
  };

  const handleSubmit = function (e) {
    e.preventDefault();

    // send message to server (axios is not right tool for the job)
    // (eventTypeName that the server is expecting, dataToSend})
    // after server receives this data and accepts it, it then broadcasts it to all others with open socket connection to the server listening for a particular type of data
    socket.emit('chatFromBrowser', { message: localState.fieldValue, token: globalState.userCredentials.token });

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
                  {/* don't need to view your own name in the chat window */}
                  <div className="chat-message-inner">{msg.message}</div>
                </div>
                <Link to={`/profile/${msg.username}`}>
                  <img className="chat-avatar avatar-tiny" src={msg.avatar} />
                </Link>
              </div>
            );
          }

          // if we someone else sent the msg
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${msg.username}`}>
                <img className="avatar-tiny" src={msg.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${msg.username}`}>
                    <strong>{msg.username}: </strong>
                  </Link>
                  {msg.message}
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
