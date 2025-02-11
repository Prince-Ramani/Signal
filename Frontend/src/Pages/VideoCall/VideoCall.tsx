import { useWebsocket } from "@/Context/Websocket";
import { memo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
const VideoCall = memo(() => {
  const { isOnCall, setIsOnCall, socket, sendSignal } = useWebsocket();

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>();
  const [isCallInProgress, setCallIsInProgress] = useState(false);

  if (!socket) return;

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.event === "VideoCall") {
      handleCall(data);
    }
  };

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
    const peer = new RTCPeerConnection();
    await peer.setRemoteDescription(message.offer);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: "iceCandidate", candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    sendSignal({ type: "answer", answer });

    setPeerConnection(peer);
    setCallIsInProgress(true);
  };

  const handleAnswer = (message: any) => {
    const peer = peerConnection;
    peer?.setRemoteDescription(new RTCSessionDescription(message.answer));
  };

  const handleIceCandidate = (message: any) => {
    const peer = peerConnection;
    peer?.addIceCandidate(new RTCIceCandidate(message.iceCandidate));
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;

    const peer = new RTCPeerConnection();

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: "iceCandidate", candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    sendSignal({ type: "offer", offer });

    setPeerConnection(peer);
    setCallIsInProgress(true);
  };

  const closeCall = () => {
    peerConnection?.close();
    setPeerConnection(null);

    setCallIsInProgress(false);
    setIsOnCall(null);
  };

  return (
    <div className="bg-purple-800 w-full flex flex-col justify-center items-center select-none">
      <div className="flex flex-col items-center gap-5">
        <img
          src={isOnCall?.profilePicture}
          alt="peofilePicture"
          className="size-32 rounded-full "
        />
        <div className="text-xl md:text-2xl xl:text-3xl font-semibold">
          {isOnCall?.username}
        </div>
        <div>0:00</div>
      </div>
    </div>
  );
});

export default VideoCall;
