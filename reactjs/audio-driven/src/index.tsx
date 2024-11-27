import { TrulienceAvatar } from "trulience-sdk";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import React from "react";
import useAppQueryParams from "./hooks/useAppQueryParams";

const Agent = forwardRef((props: any, ref) => {

  const { avatarId, sdkURL, token } = useAppQueryParams()

  useImperativeHandle(ref, () => ({

    // Expose the sendMessage method to send the message to the avatar.
    sendMessage(msg: string) {
      let trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
      trulienceObj?.sendMessage(msg);
    }

  }));

  // Get the received audio track from parent component
  const { audioTrack } = props;

  // Maintain a ref to the Trulience Avatar component to call messages on it.
  const trulienceAvatarRef = useRef<TrulienceAvatar | null>(null);

  // Keep track of the media stream created from the audio track
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Keep track of the server connection status.
  const [serverConnected, setServerConnected] = useState<boolean>(false);

  // Provide the media stream to the TrulienceAvatar component.
  useEffect(() => {
    // Check if the ref is set and call a method on it
    if (trulienceAvatarRef.current) {
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
      if (audioTrack && !mediaStream && serverConnected) {
        console.log("Audiotrack is available.");

        // Create and set the media stream object.
        const stream = new MediaStream([audioTrack.getMediaStreamTrack()]);
        setMediaStream(stream);
        console.log("Created MediaStream = ", stream);
      } else {
        console.log("Setting mediaStream null");
        setMediaStream(null);
      }
      return () => {
        console.log("Cleanup - setting mediastream null");
        setMediaStream(null);
      };
  }, [audioTrack, serverConnected]);

  // Sample for listening to truilence notifications.
  // Refer https://www2.trulience.com/docs#/client-sdk/sdk?id=trulience-events for a list of all the events fired by Trulience SDK.
  const authSuccessHandler = (resp: string) => {
    console.log("In callback authSuccessHandler resp = ", resp);
  }

  const websocketConnectHandler = (resp: string) => {
    console.log("In callback websocketConnectHandler resp = ", resp);
    setServerConnected(true);
  }

  const loadProgress = (progressDetails: { [key: string]: any }) => {
    console.log("In callback loadProgress progressDetails = ", progressDetails);
    if (trulienceAvatarRef.current && progressDetails && progressDetails.percent && progressDetails.percent === 1) {
      console.error("In callback loadProgress percent = ", progressDetails.percent);
      trulienceAvatarRef.current?.getTrulienceObject()?.sendMessageToAvatar("<trl-load animations='https://digitalhuman.uk/assets/characters/Amie_Rigged_cmp/Amie_Dances.glb' />");
      console.error("anims loaded in loadProgress");
    }
  }

  const eventCallbacks = {
    "auth-success": authSuccessHandler,
    "websocket-connect": websocketConnectHandler,
    "load-progress": loadProgress
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <TrulienceAvatar
          url={sdkURL}
          ref={trulienceAvatarRef}
          avatarId={avatarId}
          token={token}
          eventCallbacks={eventCallbacks}
          width="100%"
          height="100%"
        />
      </div>
  )
});

export default Agent;