import React, { useEffect, useRef, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer, Chat } from '@livekit/components-react';
import App from '../App'
import TokenService from './util/TokenService';

function AppLiveKitWrapper() {
  const url = process.env.REACT_APP_LIVEKIT_URL;
  const [shouldConnectLiveKit, setShouldConnectLiveKit] = useState(false);
  const [liveKitConnected, setLiveKitConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [tempMessage, setTempMessage] = useState("");
  const [token, setToken] = useState(null);
  const [avatarId, setAvatarId] = useState("");

  // This will hold the mic toggle function provided by App
  // const [toggleMicFunction, setToggleMicFunction] = useState<(() => Promise<boolean>) | null>(null);
  const [toggleMicFunction, setToggleMicFunction] = useState(null);

  const [isMicMuted, setIsMicMuted] = useState(false);

  // Handle start call
  const handleStartCall = async () => {
    try {
      // const urlParams = new URLSearchParams(window.location.search);
      // const lang = urlParams.get('lang');

      const query = new URLSearchParams(window.location.search);
      const avatarId = query.get("avatarId");
      setAvatarId(avatarId ?? process.env.REACT_APP_TRULIENCE_AVATAR_ID);
      const apiKey = process.env.REACT_APP_LIVEKIT_API_KEY || ""; // Ensure your API key is set
      const apiSecret = process.env.REACT_APP_LIVEKIT_API_SECRET || ""; // Ensure your API secret is set
      const tokenService = new TokenService(apiKey, apiSecret);

      // Await the async generateToken method
      const tokenResult = await tokenService.generateToken();
  
      console.log("Token Result:", tokenResult);
      setToken(tokenResult.accessToken);
      setShouldConnectLiveKit(true);
    } catch (error) {
      console.error("Error during startCall:", error.message);
    }
  };
  
  // Handle end call
  const handleEndCall = () => {
    setShouldConnectLiveKit(false);
  };

  // Handle text change
  const handleTextChange = (e) => {
    setTempMessage(e.target.value);
  };

  // Handle send message
  const handleSendMsg = () => {
    setMessage(tempMessage);
    setTempMessage("");
  };
  
  // Handle Mic Update
  const handleMicToggle = async () => {
    if (toggleMicFunction) {
      try {
        const success = await toggleMicFunction(); // Call the function from App
        if (success) {
          setIsMicMuted((prevState) => !prevState); // Toggle button text on success
        } else {
          console.error("Mic toggle failed.");
        }
      } catch (error) {
        console.error("Error while toggling mic:", error);
      }
    }
  };

  // Handle when the room connects
  const onConnected = () => {
    console.log('Connected to LiveKit');
    setLiveKitConnected(true);
  };
  const onDisconnected = () => {
    console.log("Disconnected from LiveKit");
    setLiveKitConnected(false);
  }

  useEffect(() => {
    // Check if URL and token are available
    if (!url || !token) {
      console.error('Missing LiveKit URL or Token');
    }
  }, [url, token]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>LiveKit Audio Room</h1>
      <button onClick={handleStartCall} style={{ marginRight: '10px' }}>Start Call</button>
      <button onClick={handleEndCall} style={{ marginRight: '10px' }}>End Call</button>
      <button onClick={handleMicToggle} style={{ marginRight: '10px' }}>
        {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
      </button>
      <button onClick={handleSendMsg}>Send Msg</button>
      <div style={{ marginTop: '20px' }}>
        <textarea
          value={tempMessage}
          onChange={handleTextChange}
          placeholder="Enter your message"
          rows="4"
          cols="50"
        />
      </div>
      {url && token && (
        <LiveKitRoom
          serverUrl={url}
          token={token}
          onConnected={onConnected}
          onDisconnected={onDisconnected}
          connect={shouldConnectLiveKit}
        >
          <App 
            connectAvatar={liveKitConnected}
            setToggleMicFunction={setToggleMicFunction} // Pass the setter for toggleMicFunction
            message={message}
            avatarId={avatarId}
          />

          <RoomAudioRenderer volume="0"/>
        </LiveKitRoom>
      )}
    </div>
  );
};

export default AppLiveKitWrapper;
