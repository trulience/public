import React from "react";
import { TrulienceAvatar } from "trulience-sdk";
import { useRef, forwardRef, useImperativeHandle } from "react";

type AgentProps = {
  setIsSpeakerEnabled(isEnabled: boolean): void;
  setIsMicEnabled(isEnabled: boolean): void;
};

export type AgentRefHandler = {
  sendMessage(msg: string): void;
  setSpeakerEnabled(isEnabled: boolean): void;
  setMicEnabled(isEnabled: boolean): void;
};

const Agent = forwardRef<AgentRefHandler, AgentProps>(
  ({ setIsSpeakerEnabled, setIsMicEnabled }, ref) => {
    
    // Maintain a ref to the Trulience Avatar component to call messages on it.
    const trulienceAvatarRef = useRef<TrulienceAvatar | null>(null);

    // Expose the methods to the parent component.
    useImperativeHandle(ref, () => ({
      sendMessage(msg: string) {
        const trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
        trulienceObj?.sendMessage(msg);
      },
      setSpeakerEnabled(isEnabled: boolean) {
        const trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
        trulienceObj?.setSpeakerEnabled(isEnabled);
      },
      setMicEnabled(isEnabled: boolean) {
        const trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
        trulienceObj?.setMicEnabled(isEnabled);
      },
    }), []);

    const authSuccessHandler = (resp: string) => {
      console.log("In callback authSuccessHandler resp = ", resp);
    };

    const websocketConnectHandler = (resp: string) => {
      console.log("In callback websocketConnectHandler resp = ", resp);
    };

    const mediaConnectedHandler = () => {
      console.log("In callback mediaConnectedHandler");
      // Enable mic and speaker if you want to enable it by default
      const trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
      if (trulienceObj) {
        trulienceObj.setSpeakerEnabled(true);
        trulienceObj.setMicEnabled(true, false);
      }
    };

    const micAccessHandler = (
      resp:
        | boolean
        | { permissionGranted: boolean; state: "granted" | "prompt" | "denied" }
    ) => {
      console.log("In callback micAccessHandler resp = ", resp);
      if (typeof resp === "boolean") {
        setIsMicEnabled(resp);
        return;
      }
      setIsMicEnabled(resp.permissionGranted);
    };

    const micUpdateHandler = (isEnabled: boolean) => {
      console.log("In callback micUpdateHandler isEnabled = ", isEnabled);
      setIsMicEnabled(isEnabled);
    };

    const speakerUpdateHandler = (isEnabled: boolean) => {
      console.log("In callback micAccessHandler isEnabled = ", isEnabled);
      setIsSpeakerEnabled(isEnabled);
    };

    // Sample for listening to trulience notifications.
    // Refer https://trulience.com/docs#/client-sdk/sdk?id=trulience-events for a list of all the events fired by Trulience SDK.
    const eventCallbacks = {
      "auth-success": authSuccessHandler,
      "websocket-connect": websocketConnectHandler,
      "media-connected": mediaConnectedHandler,
      "mic-update": micUpdateHandler,
      "mic-access": micAccessHandler,
      "speaker-update": speakerUpdateHandler,
    };

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <TrulienceAvatar
          url={process.env.REACT_APP_TRULIENCE_SDK_URL}
          ref={trulienceAvatarRef}
          avatarId={process.env.REACT_APP_TRULIENCE_AVATAR_ID || ""}
          token={process.env.REACT_APP_TRULIENCE_TOKEN}
          eventCallbacks={eventCallbacks}
          width="100%"
          height="100%"
        />
      </div>
    );
  }
);

export default Agent;
