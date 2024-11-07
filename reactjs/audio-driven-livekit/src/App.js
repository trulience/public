import './App.css';
import Agent from "./index.tsx";
import {useState, useEffect, useRef} from "react";
import {
  useConnectionState,
  useLocalParticipant,
  useRoomInfo,
  useVoiceAssistant,
  useChat
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

function App(props) {
  const [isCallStarted, setIsCallStarted] = useState(false);
  const agentRef = useRef(null);
  const chat = useChat();
  const voiceAssistant = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const roomState = useConnectionState();
  const setToggleMicFunction = props.setToggleMicFunction;

  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
      window.localParticipant = localParticipant;
    }
  }, [localParticipant, roomState]);

  useEffect(() => {
    // Define the mic toggle function
    const toggleMic = async () => {
      if (!localParticipant) {
        console.error("No participant connected.");
        return false;
      }
      const firstEntry = localParticipant.audioTrackPublications.size > 0 ? 
      ( localParticipant.audioTrackPublications.entries().next().value ) : null;
      let audioTrack = null;
      if (firstEntry) {
        const [key, value] = firstEntry;
        audioTrack = value;
      }
      console.log("audioTrack = ", audioTrack);
      if (audioTrack) {
        if (audioTrack.isMuted) {
          await localParticipant.setMicrophoneEnabled(true);
        } else {
          await localParticipant.setMicrophoneEnabled(false);
        }
        return true;
      } else {
        return false;
      }
    };

    // Pass the toggleMic function back to the parent via setToggleMicFunction
    setToggleMicFunction(() => toggleMic);

    // Cleanup the function when component unmounts
    return () => {
      setToggleMicFunction(null);
    };
  }, [localParticipant, setToggleMicFunction]);

  // Trigger Avatar connect and disconnect
  useEffect(() => {    
    setIsCallStarted(props.connectAvatar);
  }, [props.connectAvatar]);

  // Trigger sending message to avatar
  useEffect(() => {

    // Define a async function so that we can use await on the chat.send
    const sendMsg = async (msg) => {
      await chat.send(msg);
    };

    if (roomState === ConnectionState.Connected) {
      sendMsg(props.message);
    }
    
  }, [props.message]);

  const [audioTrack, setAudioTrack] = useState(voiceAssistant.audioTrack);

  useEffect(() => {
    setAudioTrack(voiceAssistant.audioTrack);
  }, [voiceAssistant.audioTrack]);

  return (
    <div style={{ marginLeft : '10px' }}>
      {isCallStarted && 
        <div style={{ width: '720px', height: '405px', marginTop: '10px' }}>
          <Agent 
            // Maintain a ref to call methods on the component.
            ref={agentRef}
            // Pass the audio track to the component.
            audioTrack = {audioTrack} 
            avatarId = {props.avatarId}
          />
        </div>
      }
    </div>
  );
}

export default App;
