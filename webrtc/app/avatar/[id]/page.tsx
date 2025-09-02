"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { TrulienceAvatar } from "@trulience/react-sdk";

export default function AvatarPage() {
  const { id } = useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [connected, setConnected] = useState(false);
  const [dc, setDc] = useState<RTCDataChannel | null>(null);
  const trulienceRef = useRef<any>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

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
      // Get ephemeral key from backend
      const tokenResponse = await fetch("/api/token");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY =
        data?.client_secret?.value || data?.value || data?.secret;
      if (!EPHEMERAL_KEY) {
        console.error("Token response:", data);
        throw new Error("Failed to get ephemeral key");
      }

      // Create peer connection
      const newPc = new RTCPeerConnection();
      setPc(newPc);

      // Set up audio playback (muted to avoid duplicate audio)
      if (audioRef.current) {
        audioRef.current.autoplay = true;
        audioRef.current.muted = true;
      }
      newPc.ontrack = (e) => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
        setRemoteStream(e.streams[0]);

        // Attach to Trulience inside user gesture context
        if (trulienceRef.current) {
          trulienceRef.current.setMediaStream(e.streams[0]);
          const trulienceObj = trulienceRef.current.getTrulienceObject();
          if (trulienceObj) {
            trulienceObj.setSpeakerEnabled(true);
          }
        }
      };

      // Add microphone input
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      newPc.addTrack(ms.getTracks()[0]);

      // Data channel for events
      const channel = newPc.createDataChannel("oai-events");
      setDc(channel);

      channel.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Server event:", event);
        } catch {
          console.log("Raw message:", e.data);
        }
      });

      // Create offer
      const offer = await newPc.createOffer();
      await newPc.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime/calls";
      const model = "gpt-realtime";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await newPc.setRemoteDescription(new RTCSessionDescription(answer));

      setConnected(true);
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  const disconnectSession = () => {
    if (pc) {
      pc.getSenders().forEach((sender: RTCRtpSender) => sender.track?.stop());
      pc.close();
      setPc(null);
    }
    setConnected(false);
    setDc(null);
    setRemoteStream(null);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-3xl font-bold">
        Trulience OpenAI Realtime WebRTC Demo
      </h1>
      <button
        onClick={startSession}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={connected}
      >
        {connected ? "Connected" : "Start Session"}
      </button>
      <audio ref={audioRef} style={{ display: "none" }} />
      <div className="absolute inset-0">
        <TrulienceAvatar
          ref={trulienceRef}
          url={process.env.NEXT_PUBLIC_TRULIENCE_SDK_URL || ""}
          avatarId={id as string}
          token={process.env.NEXT_PUBLIC_TRULIENCE_TOKEN || ""}
          width="100%"
          height="100%"
          eventCallbacks={eventCallbacks}
        />
      </div>
      <button
        onClick={connected ? disconnectSession : startSession}
        className={`absolute bottom-6 px-6 py-3 rounded-lg text-white font-semibold transition ${
          connected
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {connected ? "Disconnect" : "Connect"}
      </button>
    </main>
  );
}
