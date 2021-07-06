import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import TextField from '@material-ui/core/TextField';
import './App.css';

function App() {
  const [state, setState] = useState({ message: '', name: '' });
  const [chat, setChat] = useState([]);

  const socketRef = useRef();

  useEffect(() => {
    console.log('render');
    changeSocket();
    return () => {
      console.log('cleanup');
    };
  }, []);

  const onChannelChange = (e) => {
    changeSocket(e.target.value);
    setChat([]);
  };

  const changeSocket = (channelId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (channelId) {
      socketRef.current = io.connect(
        `http://localhost:8000/channel-${channelId}`
      );
      socketRef.current.on('message', ({ name, message }) => {
        console.log('new message');
        setChat((oldVal) => [...oldVal, { name, message }]);
      });
    }
  };

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    const { name, message } = state;
    socketRef.current.emit('message', { name, message });
    e.preventDefault();
    setState({ message: '', name });
  };

  const renderChat = () => {
    return chat.map(({ name, message }, index) => (
      <div key={index}>
        <h3>
          {name}: <span>{message}</span>
        </h3>
      </div>
    ));
  };

  return (
    <div className="card">
      <form onSubmit={onMessageSubmit}>
        <h1>Messenger</h1>
        <div className="name-field">
          <TextField
            name="name"
            onChange={onTextChange}
            value={state.name}
            label="Name"
          />
        </div>
        <div className="channel-field">
          <TextField
            name="channel"
            onChange={onChannelChange}
            label="Channel"
          />
        </div>
        <div>
          <TextField
            name="message"
            onChange={onTextChange}
            variant="outlined"
            value={state.message}
            label="Message"
          />
        </div>
        <button>Send Message</button>
      </form>
      <div className="render-chat">
        <h1>Chat Log</h1>
        {renderChat()}
      </div>
    </div>
  );
}

export default App;
