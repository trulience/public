"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { TrulienceAvatar } from "@trulience/react-sdk";
import Vapi from "@vapi-ai/web";

export default function AvatarPage() {
  const { id } = useParams();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const trulienceRef = useRef<any>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const eventCallbacks = {
    "websocket-connect": () => {
      console.log("Trulience websocket connected, attaching stream");
      if (remoteStream && trulienceRef.current) {
        trulienceRef.current.setMediaStream(remoteStream);
        trulienceRef.current.getTrulienceObject().setSpeakerEnabled(true);
        console.log("Stream attached and speaker enabled (happy path)");
      }
    },
  };

  const startSession = async () => {
    try {
      setConnecting(true);
      const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

      if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
        throw new Error(
          "Missing VAPI_PUBLIC_KEY or VAPI_ASSISTANT_ID in environment variables"
        );
      }

      // Create Vapi instance
      const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
      setVapi(vapiInstance);

      // Set up event listeners
      vapiInstance.on("call-start", () => {
        console.log("Vapi call started");
        setConnected(true);
        setConnecting(false);
      });

      vapiInstance.on("call-end", () => {
        console.log("Vapi call ended");
        setConnected(false);
        setRemoteStream(null);
      });

      vapiInstance.on("speech-start", () => {
        console.log("Assistant started speaking");
      });

      vapiInstance.on("speech-end", () => {
        console.log("Assistant stopped speaking");
      });

      vapiInstance.on("volume-level", (volume) => {
        console.log(`Assistant volume level: ${volume}`);
      });

      vapiInstance.on("message", (message) => {
        console.log("Vapi message:", message);
      });

      vapiInstance.on("error", (error) => {
        console.error("Vapi error:", error);
      });

      // Listen for video track from Vapi
      vapiInstance.on("video", (track) => {
        console.log("Received video track from Vapi:", track);
        // Note: Vapi provides video track, but for audio we need to get it differently
      });

      // Get the Daily call object to access audio streams
      const dailyCallStarted = new Promise((resolve) => {
        const checkDaily = () => {
          const dailyCall = vapiInstance.getDailyCallObject();
          if (dailyCall) {
            console.log("Daily call object available");

            // Listen for remote participant tracks
            dailyCall.on("track-started", (event) => {
              console.log("Daily track started:", event);
              if (
                event.participant &&
                !event.participant.local &&
                event.track.kind === "audio"
              ) {
                console.log("Received audio track from Vapi");
                const stream = new MediaStream([event.track]);
                setRemoteStream(stream);

                // Attach to Trulience inside user gesture context
                if (trulienceRef.current) {
                  trulienceRef.current.setMediaStream(stream);
                  const trulienceObj =
                    trulienceRef.current.getTrulienceObject();
                  if (trulienceObj) {
                    trulienceObj.setSpeakerEnabled(true);
                  }
                }

                // Find and mute Vapi's automatically created audio player to prevent double audio
                setTimeout(() => {
                  const vapiAudioPlayer = document.querySelector(
                    `audio[data-participant-id="${
                      event.participant!.session_id
                    }"]`
                  ) as HTMLAudioElement;
                  if (vapiAudioPlayer) {
                    vapiAudioPlayer.muted = true;
                    console.log(
                      "Muted Vapi audio player to prevent double audio"
                    );
                  }
                }, 100); // Small delay to ensure Vapi has created the audio element
              }
            });

            resolve(dailyCall);
          } else {
            setTimeout(checkDaily, 100);
          }
        };
        checkDaily();
      });

      // Start the Vapi call
      await vapiInstance.start(VAPI_ASSISTANT_ID);

      // Wait for Daily call to be ready
      await dailyCallStarted;
    } catch (err) {
      console.error("Error starting session:", err);
      setConnected(false);
      setConnecting(false);
    }
  };

  const disconnectSession = async () => {
    if (vapi) {
      await vapi.stop();
      setVapi(null);
    }
    setConnected(false);
    setRemoteStream(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapi) {
        vapi.stop();
      }
    };
  }, [vapi]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-3xl font-bold">Trulience Vapi Demo</h1>
      <button
        onClick={startSession}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={connected || connecting}
      >
        {connected
          ? "Connected"
          : connecting
          ? "Connecting..."
          : "Start Session"}
      </button>
      <div className="absolute inset-0">
        <TrulienceAvatar
          ref={trulienceRef}
          url={process.env.NEXT_PUBLIC_TRULIENCE_SDK_URL || ""}
          avatarId={id as string}
          token={process.env.NEXT_PUBLIC_TRULIENCE_TOKEN || ""}
          width="100%"
          height="100%"
          eventCallbacks={eventCallbacks}
          avatarParams={{
            NativeBar: {
              enabled: true,
              style: {
                bar: {
                  background: "#3b82f6",
                },
                container: {
                  background: "#e0e0de",
                  "border-radius": "10px",
                  height: "10px",
                },
              },
            },
          }}
        />
      </div>
      <button
        onClick={connected ? disconnectSession : startSession}
        disabled={connecting}
        className={`cursor-pointer absolute bottom-6 px-6 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
          connected
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {connected ? "Disconnect" : connecting ? "Connecting..." : "Connect"}
      </button>
    </main>
  );
}
