"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { TrulienceAvatar } from "@trulience/react-sdk";
import { Conversation } from "@elevenlabs/client";
import { Mic, MicOff, Volume1, VolumeX } from "lucide-react";

// Configuration - change this to test different connection types
const CONNECTION_TYPE: "websocket" | "webrtc" = "webrtc";

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

      // Monkey patch Conversation.startSession with different logic for WebSocket vs WebRTC
      const originalStartSession = Conversation.startSession;
      Conversation.startSession = async (options: any) => {
        console.log(`ElevenLabsProvider: options:`, options);

        const conversation = await originalStartSession.call(
          Conversation,
          options
        );

        if (conversation && (conversation as any).output) {
          const outputInstance = (conversation as any).output;
          const context = outputInstance.context;

          if (CONNECTION_TYPE === "websocket") {
            console.log("WebSocket: Using working audio routing");
            // WebSocket: Working approach - simple disconnect/reconnect
            const mediaStreamDestination =
              context.createMediaStreamDestination();
            outputInstance.gain.disconnect();
            outputInstance.gain.connect(mediaStreamDestination);
            (outputInstance as any).mediaStream = mediaStreamDestination.stream;
          } else {
            console.log("WebRTC: Using LiveKit audio tracks approach");
            // WebRTC: Get MediaStream from LiveKit connection instead of Web Audio API

            // Still mute the audio element to prevent double audio
            if (outputInstance.audioElement) {
              outputInstance.audioElement.muted = true;
              outputInstance.audioElement.volume = 0;
              console.log("WebRTC: Muted audio element");
            }

            // For WebRTC, we need to get the MediaStream from LiveKit tracks
            // This will be handled asynchronously after the conversation starts
            console.log("WebRTC: Will extract MediaStream from LiveKit tracks after connection");
          }
        }
        return conversation;
      };

      // Start conversation with configurable connection type
      const conversationInstance = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        connectionType: CONNECTION_TYPE,
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
      console.log("ElevenLabsProvider: Conversation started");

      // Wait for the media stream to be available - different logic for WebSocket vs WebRTC
      let outputInstance: any = undefined;
      let mediaStream: MediaStream | null = null;

      if (CONNECTION_TYPE === "websocket") {
        // WebSocket: Wait for our custom mediaStream (working approach)
        for (let i = 0; i < 10; i++) {
          outputInstance = (conversationInstance as any).output;
          if (outputInstance && (outputInstance as any).mediaStream) {
            mediaStream = (outputInstance as any).mediaStream;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } else {
        // WebRTC: Extract MediaStream from LiveKit tracks
        console.log("WebRTC: Waiting for LiveKit tracks...");
        const webrtcConnection = (conversationInstance as any).connection;

        const waitForTracks = async () => {
          for (let i = 0; i < 50; i++) {
            try {
              const room = webrtcConnection?.room;
              if (room?.remoteParticipants) {
                const participants = Array.from(room.remoteParticipants.values());

                for (const participant of participants) {
                  const liveKitParticipant = participant as any;

                  // Check audioTrackPublications
                  if (liveKitParticipant.audioTrackPublications && liveKitParticipant.audioTrackPublications.size > 0) {
                    const audioTrackPublication = Array.from(liveKitParticipant.audioTrackPublications.values())[0] as any;

                    // Check if the track is subscribed
                    if (audioTrackPublication.track) {
                      const liveKitTrack = audioTrackPublication.track as any;

                      // Try to get MediaStream from LiveKit RemoteAudioTrack
                      if (liveKitTrack.mediaStream && liveKitTrack.mediaStream instanceof MediaStream) {
                        console.log("WebRTC: Found MediaStream from LiveKit RemoteAudioTrack:", liveKitTrack.mediaStream);

                        // Mute the attached audio elements to prevent original audio playback
                        // Keep the MediaStreamTrack enabled so Trulience can analyze the data
                        if (liveKitTrack.attachedElements && Array.isArray(liveKitTrack.attachedElements)) {
                          liveKitTrack.attachedElements.forEach((element: any) => {
                            if (element && element.muted !== undefined) {
                              element.muted = true;
                              element.volume = 0;
                              console.log("WebRTC: Muted attached audio element");
                            }
                          });
                        }

                        // Also check for any other audio elements that might be playing the stream
                        const allAudioElements = document.querySelectorAll('audio');
                        allAudioElements.forEach((audio) => {
                          if (audio.srcObject === liveKitTrack.mediaStream) {
                            audio.muted = true;
                            audio.volume = 0;
                            console.log("WebRTC: Muted DOM audio element playing LiveKit stream");
                          }
                        });

                        return liveKitTrack.mediaStream;
                      }

                      // Try to get MediaStreamTrack from LiveKit RemoteAudioTrack
                      if (liveKitTrack._mediaStreamTrack && liveKitTrack._mediaStreamTrack instanceof MediaStreamTrack) {
                        console.log("WebRTC: Found MediaStreamTrack from LiveKit RemoteAudioTrack");
                        const stream = new MediaStream([liveKitTrack._mediaStreamTrack]);
                        console.log("WebRTC: Created MediaStream from LiveKit MediaStreamTrack:", stream);
                        return stream;
                      }

                      // Try mediaStreamTrack property (without underscore)
                      if (liveKitTrack.mediaStreamTrack && liveKitTrack.mediaStreamTrack instanceof MediaStreamTrack) {
                        console.log("WebRTC: Found mediaStreamTrack from LiveKit RemoteAudioTrack");
                        const stream = new MediaStream([liveKitTrack.mediaStreamTrack]);
                        console.log("WebRTC: Created MediaStream from LiveKit mediaStreamTrack:", stream);
                        return stream;
                      }

                      if (i === 0) {
                        console.log("WebRTC: RemoteAudioTrack found but no valid MediaStream/MediaStreamTrack:", liveKitTrack);
                      }
                    } else {
                      if (i === 0) console.log("WebRTC: Track not available yet, waiting...");
                    }
                  }

                  // Also check trackPublications as fallback
                  if (liveKitParticipant.trackPublications && liveKitParticipant.trackPublications.size > 0) {
                    for (const [trackId, publication] of liveKitParticipant.trackPublications.entries()) {
                      const pub = publication as any;
                      if (pub.kind === 'audio' && pub.track && pub.track instanceof MediaStreamTrack) {
                        console.log("WebRTC: Found valid MediaStreamTrack from generic publication");
                        const stream = new MediaStream([pub.track]);
                        return stream;
                      }
                    }
                  }
                }
              }
            } catch (e) {
              console.log("WebRTC: Error checking for tracks:", e);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          return null;
        };

        mediaStream = await waitForTracks();
        if (!mediaStream) {
          console.warn("WebRTC: Could not get MediaStream from LiveKit tracks");
        }
      }

      if (mediaStream) {
        console.log("MediaStream available, attaching to Trulience");

        // Send the media stream to Trulience for lip sync
        trulienceRef.current.setMediaStream(mediaStream);
        setRemoteStream(mediaStream);

        // Enable speaker to ensure audio plays through Trulience
        const trulienceObj = trulienceRef.current.getTrulienceObject();
        if (trulienceObj) {
          trulienceObj.setSpeakerEnabled(true);
          console.log("Speaker enabled on Trulience");
        }

        console.log(`${CONNECTION_TYPE}: MediaStream set to Trulience for lip sync`);
      } else {
        console.log(`${CONNECTION_TYPE}: mediaStream not available after wait`);
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
