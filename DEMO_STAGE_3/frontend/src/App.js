import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PhoneIcon from '@material-ui/icons/Phone';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect('/');

function App() {
  const [me, setMe] = useState('');
  const [name, setName] = useState('');
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callActive, setCallActive] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on('me', (id) => {
      setMe(id);
    });

    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on('callEnded', (data) => {
      setReceivingCall(false);
      setCaller('');
      setCallerName('');
      setCallerSignal(null);
      setCallActive(false);
      setIdToCall('');
    });
  }, []);

  const callUser = (id) => {
    setIsCalling(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on('callAccepted', (data) => {
      setCallerName(data.name);
      setCallActive(true);
      setIsCalling(false);
      setCaller(data.from);
      peer.signal(data.signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallActive(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', {
        signal: data,
        name: name,
        from: me,
        to: caller,
      });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    socket.emit('callEnded', {
      to: caller,
      from: me,
    });
    setReceivingCall(false);
    setCaller('');
    setCallerName('');
    setCallerSignal(null);
    setCallActive(false);
    setIdToCall('');
    connectionRef.current.destroy();
  };

  return (
    <>
      <h1
        style={{
          display: 'flex',
          justifyContent: 'center',
          testAlign: 'center',
          color: '#fff',
          fontSize: 50,
        }}
      >
        !Zoom
      </h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: '450px' }}
              />
            )}
          </div>
          <div className="video">
            {callActive ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: '450px' }}
              />
            ) : null}
          </div>
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: '20px' }}
          />

          <CopyToClipboard text={me} style={{ marginBottom: '1rem' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy Id
            </Button>
          </CopyToClipboard>

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />

          <div className="call-button">
            {callActive ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <>
                <IconButton
                  color="primary"
                  aria-label="call"
                  onClick={() => callUser(idToCall)}
                >
                  <PhoneIcon fontSize="large" />
                </IconButton>
                {isCalling && <h1>Calling</h1>}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="answer-call">
        {receivingCall && !callActive ? (
          <div className="caller">
            <hi style={{ fontSize: 20 }}>{callerName} is calling...</hi>
            <Button
              variant="contained"
              color="primary"
              onClick={answerCall}
              style={{
                width: 200,
                fontSize: 16,
                color: 'white',
                backgroundColor: 'green',
              }}
            >
              Answer Call
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default App;
