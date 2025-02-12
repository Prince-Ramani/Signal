import { useAuthUser } from "@/Context/authUserContext";
import { useWebsocket } from "@/Context/Websocket";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
const VideoCall = memo(() => {
  const { isOnCall, setIsOnCall, sendSignal } = useWebsocket();

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [isCallInProgress, setCallIsInProgress] = useState(false);
  const { authUser } = useAuthUser();

  if (!authUser) return;

  const iceConfiguration: any = {};
  iceConfiguration.iceServers = [
    {
      urls: "stun:stun1.l.google.com:19302",
    },
    {
      urls: "stun:stun3.l.google.com:19302",
    },
    {
      urls: "stun:stun4.l.google.com:19302",
    },
  ];

  const handleCall = (data: any) => {
    switch (data.type) {
      case "offer":
        handleOffer(data);
        break;
      case "answer":
        handleAnswer(data);
        break;
      case "iceCandidate":
        handleIceCandidate(data);
        break;
      default:
        console.log("Invalid message");
    }
  };

  const handleOffer = async (message: any) => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    const peer = new RTCPeerConnection(iceConfiguration);
    setPeerConnection(peer);
    try {
      await peer.setRemoteDescription(message.offer);
    } catch (error) {
      toast.error("Failed to set remote description.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (!stream) {
      toast.error("Video src not available!");
      return;
    }

    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({
          type: "iceCandidate",
          candidate: e.candidate,
          event: "call",
          id: isOnCall?.id,
          profilePicture: authUser.profilePicture,
          username: authUser.username,
        });
      }
    };

    peer.ontrack = (e) => {
      remoteVideoRef.current!.srcObject = e.streams[0];
    };

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    sendSignal({
      type: "answer",
      answer,
      event: "call",
      id: isOnCall?.id,
      profilePicture: authUser.profilePicture,
      username: authUser.username,
    });
    setCallIsInProgress(true);
  };

  const handleAnswer = (message: any) => {
    console.log("Answer outside", peerConnection);
    if (peerConnection) {
      console.log("Answer got called!");
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(message.answer)
      );
    }
  };

  const handleIceCandidate = (message: any) => {
    console.log("Ice candiate outisde", peerConnection);
    if (peerConnection) {
      console.log("iceCandidate got called!");
      peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;

    if (!stream) {
      toast.error("Video src not available!");
      return;
    }

    const peer = new RTCPeerConnection(iceConfiguration);
    console.log("Peer created", peer);

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({
          type: "iceCandidate",
          candidate: e.candidate,
          event: "call",
          id: isOnCall?.id,
          profilePicture: authUser.profilePicture,
          username: authUser.username,
        });
      }
    };

    peer.ontrack = (e) => {
      console.log("Snedin track", e.streams[0]);
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    sendSignal({
      type: "offer",
      offer,
      event: "call",
      id: isOnCall?.id,
      profilePicture: authUser.profilePicture,
      username: authUser.username,
    });
    setPeerConnection(peer);

    setCallIsInProgress(true);
  };

  const closeCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      stream.getTracks().forEach((track: any) => track.stop());
    }

    setIsOnCall(null);
    setCallIsInProgress(false);
  };

  useEffect(() => {
    if (isOnCall && isOnCall.event === "IncomingCall") {
      handleCall(isOnCall);
      return;
    }
    startCall();

    return () => {
      closeCall();
    };
  }, [isOnCall]);

  return (
    <div className="bg-purple-800 w-full  max-h-screen flex flex-col justify-center items-center select-none">
      <div className="w-full h-full relative">
        <div className="h-32 w-24 border bg-white absolute bottom-10 right-5">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover  "
          />
        </div>
        <div className=" border bg-yellow-500 h-full w-full  ">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover "
          />
        </div>
      </div>
    </div>
  );
});

export default VideoCall;
