import React, { useEffect, useState } from "react";
import { TrulienceAvatar, TrulienceAvatarProps } from "trulience-sdk";
import { useRef } from "react";
import { useAvatarContext } from "./context/AvatarContext";
import ProgressBar from "./components/ProgressBar";
import useIframeEventHandler from "./hooks/useIframeEventHandler";
import AvatarControls from "./components/AvatarControls";

import "./Agent.css";
import useAppQueryParams from "./hooks/useAppQueryParams";
import ConsoleLogger from "../helper/ConsoleLogger";
import nativeBridge from "../helper/nativeBridge";

const logger = new ConsoleLogger("Agent")

const Agent = () => {

  const queryParams = useAppQueryParams()
  const { state, dispatch } = useAvatarContext();
  const [errorMessage, setErrorMessage] = useState("");
  
  // Maintain a ref to the Trulience Avatar component to call messages on it.
  const trulienceAvatarRef = useRef<TrulienceAvatar | null>(null);

  // Hook to handle messages from the parent.
  const { registerTrulienceEvents, postMessageToParent} = useIframeEventHandler(trulienceAvatarRef);

  // Automatically connect the avatar if connect is set to true
  useEffect(() => {
    if (queryParams.connect) {
      dispatch({ type: "SET_CALL_STARTED", payload: true });
      dispatch({ type: "SET_LOADING_PROGRESS", payload: 5 })
    }
  }, [queryParams.connect, dispatch]);


  // Event Handler
  const authSuccessHandler = (resp: string) => {
    const trulienceObj = trulienceAvatarRef.current?.getTrulienceObject();
    dispatch({ type: "SET_TRULIENCE", payload: trulienceObj });

    // Register the iframe events
    registerTrulienceEvents()

    // Pass the auth-success event to the parent, as the event was fired before iframe events registered
    postMessageToParent("auth-success", resp)
  };

  const authFailHandler = (resp: { errorTitle: string }) => {
    setErrorMessage(resp.errorTitle);
    // Pass the auth-fail event to the parent, as the event was fired before iframe events registered
    postMessageToParent("auth-fail", resp)
  };

  const micAccessHandler = (resp: boolean) => {
    if (typeof resp === "boolean") {
      dispatch({ type: "SET_MIC", payload: resp });
      return;
    }
  };

  const micUpdateHandler = (isEnabled: boolean) => {
    dispatch({ type: "SET_MIC", payload: isEnabled });
  };

  const speakerUpdateHandler = (isEnabled: boolean) => {
    dispatch({ type: "SET_SPEAKER", payload: isEnabled });
  };

  const loadProgressHandler = (event: { percent: number }) => {
    dispatch({ type: "SET_LOADING_PROGRESS", payload: event.percent * 100 });

    if(event.percent === 1) {
      logger.log("Avatar has been loaded completed")
      nativeBridge.eventAvatarLoaded()
    }
  };


  // Sample for listening to trulience notifications.
  // Refer https://trulience.com/docs#/client-sdk/sdk?id=trulience-events for a list of all the events fired by Trulience SDK.
  let eventCallbacks: TrulienceAvatarProps["eventCallbacks"] = {
    "auth-success": authSuccessHandler,
    "auth-fail": authFailHandler,
    "load-progress": loadProgressHandler,
  };

  // Add the following events when the avatar control button is shown
  if (!queryParams.showFullscreenAvatar) {
    eventCallbacks = {
      ...eventCallbacks,
      "mic-update": micUpdateHandler,
      "mic-access": micAccessHandler,
      "speaker-update": speakerUpdateHandler,
    };
  }

  const showFSAvatarStyle = queryParams.showFullscreenAvatar
    ? { padding: "unset", height: "100%" }
    : {};

  return (
    <div className={"agentContainer"} style={showFSAvatarStyle}>
      {/* Hide the avatar control if fullscreen avatar is enable */}
      {!queryParams.showFullscreenAvatar && <AvatarControls />}

      {state.isCallStated && (
        <div className="avatarContainer">
          <TrulienceAvatar
            width="100%"
            height="100%"
            url={queryParams.sdkURL}
            ref={trulienceAvatarRef}
            avatarId={queryParams.avatarId}
            token={queryParams.token}
            eventCallbacks={eventCallbacks}
            backgroundColor={queryParams.avatarBackgroundColor}
          />

          <ProgressBar
            bgcolor={queryParams.loadingBarColor}
            completed={state.loadingProgress}
            hideProgressBar={!!errorMessage}
          />

          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
      )}
    </div>
  );
};

export default Agent;
