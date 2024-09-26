import React, { useState } from "react";
import { useAvatarContext } from "../context/AvatarContext";

const AvatarControls: React.FC = () => {
  const { state, dispatch } = useAvatarContext();
  const [message, setMessage] = useState<string>("");

  const startCall = () => {
    dispatch({ type: "SET_CALL_STARTED", payload: true })
  };

  const endCall = () => {
    dispatch({ type: "SET_CALL_STARTED", payload: false })
  };

  const toggleMic = () => {
    state.trulience?.setMicEnabled(!state.isMicEnabled);
  };

  const toggleSpeaker = () => {
    state.trulience?.setSpeakerEnabled(!state.isSpeakerEnabled);
  };

  const handleSendMsg = () => {
    state.trulience?.sendMessage(message);
    setMessage("");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <h1 className="header">Trulience SDK Demo</h1>
      <div>
        <div className="control-buttons">
          <button onClick={startCall}>Start Call</button>
          <button onClick={endCall}>End Call</button>
          <button onClick={toggleMic}>
            {state.isMicEnabled ? "Mute Mic" : "Unmute Mic"}
          </button>
          <button onClick={toggleSpeaker}>
            {state.isSpeakerEnabled ? "Mute Speaker" : "Unmute Speaker"}
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
    </>
  );
};

export default AvatarControls;
