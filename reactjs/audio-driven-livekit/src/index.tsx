import { TrulienceAvatar } from "@trulience/react-sdk";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import React from "react";

const Agent = forwardRef((props: any, ref) => {
  useImperativeHandle(ref, () => ({

    // Expose the sendMessage method to send the message to the avatar.
    sendMessage(msg: string) {
      let trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
      trulienceObj?.sendMessage(msg);
    }

  }));

  // Get the received audio track from parent component
  const { audioTrack, avatarId } = props;

  // Maintain a ref to the Trulience Avatar component to call messages on it.
  const trulienceAvatarRef = useRef<TrulienceAvatar | null>(null);

  // Keep track of the media stream created from the audio track
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Keep track of the server connection status.
  const [serverConnected, setServerConnected] = useState<boolean>(false);

  const [avatarLoaded, setAvatarLoaded] = useState<boolean>(false);

  const [progress, setProgress] = useState(0); // Track the progress percentage

  // Provide the media stream to the TrulienceAvatar component.
  useEffect(() => {
    // Check if the ref is set and call a method on it
    if (trulienceAvatarRef.current && mediaStream) {
      console.log("Setting MediaStream on TrulienceAvatar");
      
      // Set the media stream to make avatar speak the text.
      trulienceAvatarRef.current.setMediaStream(mediaStream);

      // Enable speakers
      let trulienceObj = trulienceAvatarRef.current.getTrulienceObject();
      if (trulienceObj) {
        trulienceObj.setSpeakerEnabled(true);
      }
    } else {
      console.log("Not Calling setMediaStream");
    }
  }, [mediaStream])

  useEffect(() => {
      // Make sure we create media stream only if not available.
      if (audioTrack && !mediaStream && serverConnected && avatarLoaded) {
        if (audioTrack && audioTrack.publication.isSubscribed) {
          const mediaStreamTrack = audioTrack.publication.track?.mediaStreamTrack;
          console.log("mediaStreamTrack = ", mediaStreamTrack);
          if (mediaStreamTrack) {
            // Create and set the media stream object.
            const stream = new MediaStream([mediaStreamTrack]);
            setMediaStream(stream);
            console.log("Created MediaStream = ", stream);    
          }
        }

      } else {
        console.log("Setting mediaStream null");
        setMediaStream(null);
      }
      return () => {
        console.log("Cleanup - setting mediastream null");
        setMediaStream(null);
      };
  }, [audioTrack, serverConnected, avatarLoaded]);

  // Sample for listening to truilence notifications.
  // Refer https://trulience.com/docs#/client-sdk/sdk?id=trulience-events for a list of all the events fired by Trulience SDK.
  const authSuccessHandler = (resp: string) => {
    console.log("In callback authSuccessHandler resp = ", resp);
  }

  const websocketConnectHandler = (resp: string) => {
    console.log("In callback websocketConnectHandler resp = ", resp);
    setServerConnected(true);
  }

  const websocketMessageHandler = (msg: string) => {
    console.log("In callback websocketMessaegHandler msg = ", msg);
  }

  const loadProgress = (progressDetails: { [key: string]: any }) => {
    console.log("In callback loadProgress progressDetails = ", progressDetails);
    
    // Update progress based on load percentage
    if (progressDetails && progressDetails.percent) {
      setProgress(progressDetails.percent * 100);
    }

    if (trulienceAvatarRef.current && progressDetails && progressDetails.percent && progressDetails.percent === 1) {
      trulienceAvatarRef.current?.getTrulienceObject()?.sendMessageToAvatar("<trl-load animations='https://digitalhuman.uk/assets/characters/Amie_Rigged_cmp/Amie_Dances.glb' />");
      setAvatarLoaded(true);
    }
  }

  const eventCallbacks = {
    "auth-success": authSuccessHandler,
    "websocket-connect": websocketConnectHandler,
    "websocket-message": websocketMessageHandler,
    "load-progress": loadProgress
  }

  return (
    <div style={styles.container}>

      {!avatarLoaded && (
        <div style={styles.progressContainer}>
          {/* Overlay the progress text */}
          <span style={styles.progressText}>{progress.toFixed(0)}%</span>
          
          {/* Progress bar */}
          <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
        </div>
      )}

      <TrulienceAvatar
          url={process.env.REACT_APP_TRULIENCE_SDK_URL}
          ref={trulienceAvatarRef}
          avatarId={avatarId}
          token={process.env.REACT_APP_TRULIENCE_TOKEN}
          eventCallbacks={eventCallbacks}
          width="100%"
          height="100%"
        />
    </div>
  )
});

// CSS styles in JavaScript for the progress bar and container
const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative' as 'relative', // Relative position for the container to overlay the progress bar
  },
  progressContainer: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%', // Center the container horizontally
    transform: 'translate(-50%, -50%)', // Center vertically and horizontally
    backgroundColor: '#f3f3f3',
    borderRadius: '10px',
    overflow: 'hidden',
    zIndex: 10, // Ensure it's on top of the avatar
    height: '30px', // Fixed height for the progress bar container
    width: '50%', // Set the container width to 50% of the parent
  },
  progressBar: {
    height: '100%', // Take full height of the container
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease',
  },
  progressText: {
    position: 'absolute' as 'absolute', // Absolutely positioned text
    width: '100%', // Span the entire container width
    textAlign: 'center' as 'center', // Center the text
    top: '0',
    left: '0',
    lineHeight: '30px', // Vertically center the text within the container's height
    color: 'black',
    fontWeight: 'bold', // Bold text for better visibility
    zIndex: 11, // Make sure the text is above the progress bar
  }
};

export default Agent;