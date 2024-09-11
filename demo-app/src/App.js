import './App.css';
import Agent from "./index.tsx";
import {useState, useEffect, useRef} from "react";

function App() {
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [message, setMessage] = useState('');
  const agentRef = useRef(null);

  // Handle start call
  const startCall = () => {
    setIsCallStarted(true);
  };

  // Handle end call
  const endCall = () => {
    setIsCallStarted(false);
  };

  // Handle text change
  const handleTextChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle send message
  const handleSendMsg = () => {
    console.log('Message:', message);
    agentRef.current.sendMessage(message);
  };

  // Get the mic audio
  const getMedia = async () => {
    try {
      return await navigator.mediaDevices.getUserMedia({audio: true, video: false});
    } catch (err){
      console.log("Error getting media", err);
    }
  };

  const [audioTrack, setAudioTrack] = useState({getMediaStreamTrack: () => null});

  useEffect(() => {
    let currentAudioTrack = null;

    // Get the audio track and save it.
    if (isCallStarted) {
      getMedia().then((userMedia) => {
        currentAudioTrack = userMedia.getAudioTracks()[0];
        if (currentAudioTrack) {
          currentAudioTrack.getMediaStreamTrack = (() => { return currentAudioTrack; });
          setAudioTrack(currentAudioTrack);
          console.log("Calling then - currentAudioTrack = ", currentAudioTrack);
        }
      });
    }
    return () => {
      // Stop the audio track if active
      if (currentAudioTrack) {
        currentAudioTrack.stop(); // Stop the audio track
        setAudioTrack(null); // Clean up the state
        console.log("Microphone input stopped and audioTrack cleaned up");
      }
    }
  }, [isCallStarted]);
  return (
    <div style={{ marginLeft : '10px' }}>
      <h1>Trulience SDK Demo</h1>
      <button onClick={startCall} style={{ marginRight: '10px' }}>Start Call</button>
      <button onClick={endCall} style={{ marginRight: '10px' }}>End Call</button>
      <button onClick={handleSendMsg}>Send Msg</button>
      <div style={{ marginTop: '20px' }}>
        <textarea
          value={message}
          onChange={handleTextChange}
          placeholder="Enter your message"
          rows="4"
          cols="50"
        />
      </div>
      {isCallStarted && 
        <div style={{ width: '720px', height: '405px', marginTop: '10px' }}>
          <Agent 
            // Maintain a ref to call methods on the component.
            ref={agentRef}
            // Pass the audio track to the component.
            audioTrack = {audioTrack} 
          />
        </div>
      }
    </div>
  );
}

export default App;
