import { useEffect } from "react";
import useAppQueryParams from "./useAppQueryParams";
import { TrulienceAvatar } from "trulience-sdk";

const IframeEvents = {
  CHAT_SEND: "trl-chat-send",      // Deprecated 
  MIC_STATUS_SET: "trl-mic-set",   // Deprecated 
  SPEAKER_STATUS_SET: "trl-speaker-set",    // Deprecated 
  AVATAR_CHAT_SEND: "trl-avatar-chat-send", // Deprecated 
  TRULIENCE_METHOD_CALL: "trl-method-call"   
}

const useIframeEventHandler = (trulienceAvatarRef: React.MutableRefObject<TrulienceAvatar | null>) => {
  
  const { registerTrlEvents } = useAppQueryParams()

  // Deprecated 
  const handleChat = (trl: any, message: string) => {
    if (typeof message === "string") {
      trl.sendMessage(message);
    } else {
      console.warn("Invalid message type for trl-chat");
    }
  };

  // Deprecated 
  const handleAvatarChat = (trl: any, message: string) => {
    if (typeof message === "string") {
      trl.sendMessageToAvatar(message);
    } else {
      console.warn("Invalid message type for trl-chat");
    }
  };

  // Deprecated 
  const handleMicStatus = (trl: any, message: boolean) => {
    if (typeof message === "boolean") {
      trl.fixAudioContext();
      trl.setMicEnabled(message, true);
    } else {
      console.warn("Invalid message type for trl-mic-status");
    }
  };

  // Deprecated 
  const handleSpeakerStatus = (trl: any, message: boolean) => {
    if (typeof message === "boolean") {
      trl.fixAudioContext();
      trl.setSpeakerEnabled(message);
    } else {
      console.warn("Invalid message type for trl-set-speaker-status");
    }
  };


  const invokeTrulienceMethod = async (trl: any, eventData: { 
    method: string,
    args?: any[],
    callId?: string
   }) => {

    const { method, args = [], callId } = eventData;

     if (!method) {
      console.warn(`Error: No method specified in eventData.`);
      return;
    }
  

    const fn = (trl as any)[method] as Function;

    if (!fn || typeof fn !== 'function') {
      console.warn(`Error: Method '${method}' not found in Trulience object.`);
      return;
    }

    try {
      // Support both sync and async method execution
      const result = await fn.apply(trl, args);

      // If a callId is provided, send the result back to the parent
      if (callId) {
        window.parent.postMessage(
          { eventName: "trl-method-response", eventParams: { callId, status: "success", result } },
          "*"
        );
      }

    } catch (error) {
      console.error(`Error executing method '${method}':`, error);
      // Send error response if callId is provided
      if (callId) {
        window.parent.postMessage(
          { eventName: "trl-method-response", eventParams: { callId, status: "error", error: String(error) } },
          "*"
        );
      }
    }

  }


  const handlePostMessage = (event: MessageEvent<any>) => {
    // Verify the origin of the message to ensure it's from a trusted source.
    if (!event.origin) {
      return; // If event.origin is missing, exit early.
    }

    const trl = trulienceAvatarRef.current?.getTrulienceObject();

    // If the object is not ready, ignore the event.
    if (!trl) {
      console.warn("Ignoring event because the object is not yet ready.");
      return;
    }

    // Ensure the message data is present.
    if (event.data == null) {
      console.warn("No event data received, ignoring the event.");
      return;
    }

    const eventData = event.data;

    // New way to handle the parent events
    if(eventData.eventName) {
      switch(eventData.eventName) {
        case IframeEvents.TRULIENCE_METHOD_CALL:
          invokeTrulienceMethod(trl, eventData.eventParams)
          break;

        default:
          console.warn("Unknown command received:", eventData.eventName);
      }
      return
    }

 

    // Deprecated way to handle the command - Call the appropriate handler based on the command.
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
        
        case IframeEvents.TRULIENCE_METHOD_CALL:
          invokeTrulienceMethod(trl, eventData)
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
