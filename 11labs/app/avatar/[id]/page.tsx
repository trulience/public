"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { TrulienceAvatar } from "@trulience/react-sdk";
import { Conversation } from "@elevenlabs/client";
import { Mic, MicOff, Volume1, VolumeX } from "lucide-react";

export default function AvatarPage() {
  const { id } = useParams();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
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
      const trulienceObj = trulienceRef.current.getTrulienceObject();
      trulienceObj.connectGateway();

      const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

      if (!ELEVENLABS_AGENT_ID) {
        throw new Error("Missing ELEVENLABS_AGENT_ID in environment variables");
      }

      // Request microphone permissions first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        // handle error
      }

      // Monkey patch Conversation.startSession (exactly like working code)
      const originalStartSession = Conversation.startSession;
      Conversation.startSession = async (options: any) => {
        console.log(`ElevenLabsProvider: options:`, options);

        const conversation = await originalStartSession.call(Conversation, options);

        if (conversation && (conversation as any).output) {
          const outputInstance = (conversation as any).output;
          const context = outputInstance.context;

          // Create a media stream destination for capturing audio
          const mediaStreamDestination = context.createMediaStreamDestination();

          // Disconnect the gain node to prevent double audio
          outputInstance.gain.disconnect();

          // Connect only to our media stream destination
          outputInstance.gain.connect(mediaStreamDestination);

          (outputInstance as any).mediaStream = mediaStreamDestination.stream;
        }
        return conversation;
      };

      // Start conversation with exact same structure as working code
      const conversationInstance = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        connectionType: "websocket", // Match the working code comment
        preferHeadphonesForIosDevices: true,
        onConnect: () => {
          console.log("ElevenLabs conversation connected");
          setConnected(true);
          setConnecting(false);
        },
        onDisconnect: () => {
          console.log("ElevenLabs conversation disconnected");
          setConnected(false);
          setRemoteStream(null);
        },
        onError: (error: any) => {
          console.error("ElevenLabs error:", error);
          setConnecting(false);
          setConnected(false);
        },
        onModeChange: (mode: any) => {
          if (mode === "speaking") {
            console.log("Assistant started speaking");
          } else if (mode === "listening") {
            console.log("Assistant stopped speaking");
          }
        },
      });

      setConversation(conversationInstance);
      console.log('ElevenLabsProvider: Conversation started');

      // Wait for the media stream to be available (exact copy from working code)
      let outputInstance: any = undefined;
      for (let i = 0; i < 10; i++) {
        outputInstance = (conversationInstance as any).output;
        if (outputInstance && (outputInstance as any).mediaStream) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (outputInstance && (outputInstance as any).mediaStream) {
        // Send the media stream to A2V for lip sync (exact copy from working code)
        trulienceRef.current.setMediaStream((outputInstance as any).mediaStream);
        setRemoteStream((outputInstance as any).mediaStream);

        // Enable speaker to ensure audio plays through Trulience
        const trulienceObj = trulienceRef.current.getTrulienceObject();
        if (trulienceObj) {
          trulienceObj.setSpeakerEnabled(true);
          console.log("Speaker enabled on Trulience");
        }

        console.log("MediaStream set to Trulience for lip sync");
      } else {
        console.log('ElevenLabsProvider: mediaStream not available after wait');
      }
    } catch (err) {
      console.error("Error starting session:", err);
      setConnected(false);
      setConnecting(false);
    }
  };

  const disconnectSession = async () => {
    const trulienceObj = trulienceRef.current.getTrulienceObject();
    trulienceObj.disconnectGateway();
    trulienceObj.preloadAvatar();
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
    }
    setConnected(false);
    setRemoteStream(null);
  };

  const toggleMic = () => {
    if (conversation) {
      conversation.setMicMuted(!isMicMuted);
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleSpeaker = () => {
    if (trulienceRef.current) {
      const trulienceObj = trulienceRef.current.getTrulienceObject();
      if (trulienceObj) {
        trulienceObj.setSpeakerEnabled(!isSpeakerMuted);
        setIsSpeakerMuted(!isSpeakerMuted);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversation) {
        conversation.endSession();
      }
    };
  }, [conversation]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-3xl font-bold">Trulience ElevenLabs Demo</h1>
      <div className="flex flex-col items-center gap-4">
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
      </div>
      <div className="absolute inset-0">
        <TrulienceAvatar
          autoConnect={false}
          prefetchAvatar={true}
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

      {connected && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button
            onClick={toggleMic}
            className={`p-2 rounded-full text-white transition cursor-pointer ${
              isMicMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={toggleSpeaker}
            className={`p-2 rounded-full text-white transition cursor-pointer ${
              isSpeakerMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          >
            {isSpeakerMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume1 className="w-5 h-5" />
            )}
          </button>
        </div>
      )}
    </main>
  );
}
