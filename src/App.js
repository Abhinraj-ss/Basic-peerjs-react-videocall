import React, { useState, useEffect,useRef } from 'react';
import Peer from 'peerjs';
import './App.css';

const App = () => {

  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [peer, setPeer] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  var myVideo = useRef();
  var friendVideo = useRef();

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setMyId(id);
      setPeer(peer);
    });

    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        setMessages([...messages, data]);
      });
    });

    peer.on('call', (call) => {
      var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (stream) => {
        if (myVideo.current){
          myVideo.current.srcObject = stream;
          myVideo.current.play().catch((error) => console.error(error));

        }
        
        call.answer(stream);

        call.on('stream', (remoteStream) => {
          if (friendVideo.current){
            friendVideo.current.srcObject = remoteStream;
            friendVideo.current.play().catch((error) => console.error(error));
          }
        });

      });
    });

    return () => {
      peer.destroy();
    }
  }, []);

  const send = () => {
    const conn = peer.connect(friendId);

    conn.on('open', () => {

      const msgObj = {
        sender: myId,
        message: message
      };

      conn.send(msgObj);

      setMessages([...messages, msgObj]);
      setMessage('');

    });
  }

  const videoCall = () => {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (stream) => {
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
        myVideo.current.play().catch((error) => console.error(error));
      }
      const call = peer.call(friendId, stream);

      call.on('stream', (remoteStream) => {
        if (friendVideo.current){
          friendVideo.current.srcObject = remoteStream;
          friendVideo.current.play().catch((error) => console.error(error));
        }
      });
    });
  }

  const endCall =() =>{
    
  }

  return (
    <div className="App">
      <div className="wrapper">
        <div className="col">
          <h3>My ID: {myId}</h3>
          <label>Friend ID:{friendId}</label>
          <input
          type="text"
          value={friendId}
          onChange={e => { setFriendId(e.target.value )}} />
      <br />
      <br />
          <label>Message:</label>
          <input
          type="text"
          value={message}
          onChange={e => { setMessage(e.target.value ) }} />
          <button onClick={send}>Send</button>
          <button onClick={videoCall}>Video Call</button>
          <button onClick={endCall}>End Call</button>
          {
            messages.map((message, i) => {
              return (
                <div key={i}>
                <h3>{message.sender}:</h3>
                <p>{message.message}</p>
                </div>
              )
            })
          }
          </div>
          <div className="col">
            <div>
              <video ref={myVideo} />
            </div>
            <div>
              <video ref={friendVideo} />
            </div>
          </div>
        </div>
    </div>
  );
}

export default App;
