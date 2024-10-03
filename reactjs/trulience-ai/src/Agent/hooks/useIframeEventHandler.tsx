import { useEffect } from "react";
import useAppQueryParams from "./useAppQueryParams";
import { TrulienceAvatar } from "trulience-sdk";

const IframeEvents = {
  CHAT_SEND: "trl-chat-send",   
  MIC_STATUS_SET: "trl-mic-set",
  SPEAKER_STATUS_SET: "trl-speaker-set",
  AVATAR_CHAT_SEND: "trl-avatar-chat"
}

const useIframeEventHandler = (trulienceAvatarRef: React.MutableRefObject<TrulienceAvatar | null>) => {
  
  const { registerTrlEvents } = useAppQueryParams()

  // Command handlers
  const handleChat = (trl: any, message: string) => {
    if (typeof message === "string") {
      trl.sendMessage(message);
    } else {
      console.warn("Invalid message type for trl-chat");
    }
  };

  const handleAvatarChat = (trl: any, message: string) => {
    if (typeof message === "string") {
      trl.sendAvatarMessage(message);
    } else {
      console.warn("Invalid message type for trl-chat");
    }
  };

  const handleMicStatus = (trl: any, message: boolean) => {
    if (typeof message === "boolean") {
      trl.fixAudioContext();
      trl.setMicEnabled(message, true);
    } else {
      console.warn("Invalid message type for trl-mic-status");
    }
  };

  const handleSpeakerStatus = (trl: any, message: boolean) => {
    if (typeof message === "boolean") {
      trl.fixAudioContext();
      trl.setSpeakerEnabled(message);
    } else {
      console.warn("Invalid message type for trl-set-speaker-status");
    }
  };

  const handlePostMessage = (event: MessageEvent<any>) => {
    // Verify the origin of the message to ensure it's from a trusted source.
    if (!event.origin) {
      return; // If event.origin is missing, exit early.
    }

    const trl = trulienceAvatarRef.current?.getTrulienceObject();

    // Ensure the message data is present.
    if (event.data == null) {
      console.warn("No event data received, ignoring the event.");
      return;
    }

    const eventData = event.data;

    // If the object is not ready, ignore the event.
    if (!trl) {
      console.warn("Ignoring event because the object is not yet ready.");
      return;
    }

    // Call the appropriate handler based on the command.
    if (eventData.command) {
      switch (eventData.command) {
        case IframeEvents.CHAT_SEND:
          handleChat(trl, eventData.message);
          break;

        case IframeEvents.MIC_STATUS_SET:
          handleMicStatus(trl, eventData.message);
          break;

        case IframeEvents.SPEAKER_STATUS_SET:
          handleSpeakerStatus(trl, eventData.message);
          break;

        case IframeEvents.AVATAR_CHAT_SEND:
          handleAvatarChat(trl, eventData.message);
          break;

        default:
          console.warn("Unknown command received:", eventData.command);
      }
    }
   
  };

  useEffect(() => {
    // Add event listener when the component mounts.
    window.addEventListener("message", handlePostMessage, false);

    // Clean up the event listener when the component unmounts.
    return () => {
      window.removeEventListener("message", handlePostMessage, false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trulienceAvatarRef]);
  

  // Action related to iframe
  const registerTrulienceEvents = () => {
    const trl = trulienceAvatarRef.current?.getTrulienceObject();
    registerTrlEvents.split(",").forEach((eventName: string) => {
      trl?.on(eventName, "iframe");
    });
  }

  const postMessageToParent = (eventName: string, eventParams: any) => {
    // Pass auth-success event if iframe has subscribed
    if (registerTrlEvents.includes(eventName)) {
      let eventData = { eventName, eventParams };
      window.parent.postMessage(eventData, document.referrer);
    }
  }

  return {
    registerTrulienceEvents,
    postMessageToParent
  }; // Hook doesn't return anything directly.
};

export default useIframeEventHandler;
