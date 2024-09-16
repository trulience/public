import React, { useState, useRef } from "react";
import Agent, { AgentRefHandler } from "./Agent";
import "./App.css";

function App() {
  const [isCallStarted, setIsCallStarted] = useState(false);

  const agentRef = useRef<AgentRefHandler>(null);
  const [message, setMessage] = useState("");
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);

  // Handle start call
  const startCall = () => {
    setIsCallStarted(true);
  };

  // Handle end call
  const endCall = () => {
    setIsCallStarted(false);
  };

  const toggleMic = () => {
    agentRef.current?.setMicEnabled(!isMicEnabled);
  };

  const toggleSpeaker = () => {
    agentRef.current?.setSpeakerEnabled(!isSpeakerEnabled);
  };

  const handleSendMsg = () => {
    agentRef.current?.sendMessage(message);
    setMessage("")
  };

  // Handle text change
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  return (
    <main>
      <h1>Trulience SDK Demo</h1>

      {/* Show avatar control button after connect */}
      <div>
        <div className="control-buttons">
          <button onClick={startCall}> Start Call </button>
          <button onClick={endCall}> End Call </button>
          <button onClick={toggleMic}>
            {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
          </button>
          <button onClick={toggleSpeaker}>
            {isSpeakerEnabled ? "Mute Speaker" : "Unmute Speaker"}
          </button>
        </div>
        <div className="message-box">
          <textarea
            value={message}
            onChange={handleTextChange}
            placeholder="Enter your message"
            rows={2}
            cols={40}
            style={{ resize: "none" }}
          />
          <button onClick={handleSendMsg}>Send Msg</button>
        </div>
      </div>

      {isCallStarted && (
        <div className="agent-wrapper">
          <Agent
            // Maintain a ref to call methods on the component.
            ref={agentRef}
            setIsSpeakerEnabled={setIsSpeakerEnabled}
            setIsMicEnabled={setIsMicEnabled}
          />
        </div>
      )}
    </main>
  );
}

export default App;
