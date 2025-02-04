import { useWebsocket } from "@/Context/Websocket";
import { memo, useEffect, useRef, useState } from "react";
import Nomessage from "./NoMessage";
import TextareaAutosize from "react-textarea-autosize";
import {
  ArrowLeft,
  Image,
  Mic,
  MoreVertical,
  Plus,
  SendHorizonal,
  Sticker,
  Video,
  X,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import Customtooltip from "@/components/ Customtooltip";
import DisplayChat from "./DisplayChat";
import { useAuthUser } from "@/Context/authUserContext";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";

const ChatBox = memo(() => {
  const { currentChat, sendPersonalMessage, setIsChatting, setCurrentChat } =
    useWebsocket();
  const { authUser } = useAuthUser();
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [video, setVideo] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState("");

  const messageRef = useRef<HTMLDivElement | null>(null);

  if (!authUser) {
    return;
  }

  const handleClick = () => {
    if (currentChat && currentChat.chatInfo._id) {
      const messageToSend = {
        message: message,
        to: currentChat.chatInfo._id,
        attachedImages: selectedImages,
        attachedVideo: video,
      };

      setMessage("");

      if (selectedImages.length > 0) setIsPending(true);

      sendPersonalMessage(messageToSend);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (
      files &&
      files.length > 0 &&
      files.length + selectedImages.length <= 4
    ) {
      if (video || videoPreview) {
        setVideo("");
        setVideoPreview("");
      }
      Array.from(files).forEach((im) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(",")[1];
          if (reader.result) {
            setImagePreview((prev) => [...prev, reader.result as string]);
          }
          if (base64data) {
            setSelectedImages((prev) => [...prev, base64data]);
          }
        };
        reader.readAsDataURL(im);
      });
      return;
    }

    if (files && files.length + selectedImages.length > 4) {
      toast.error("You can only upload 4 images at a time!");
      return;
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //@ts-ignore
    const video = e.target.files[0];

    if (video) {
      if (selectedImages.length > 0 || imagePreview.length > 0) {
        setSelectedImages([]);
        setImagePreview([]);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(",")[1];
        if (reader.result) {
          setVideoPreview(reader.result as string);
        }
        if (base64data) {
          setVideo(base64data);
        }
      };
      reader.readAsDataURL(video);
    }
  };

  const handlRemove = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });

    if (selectedImages.length > 0 && isPending && currentChat) {
      const lastChat =
        currentChat.chatHistory[currentChat.chatHistory.length - 1];
      const isUploaded =
        lastChat.from === authUser._id &&
        lastChat.attachedImages.length === selectedImages.length;

      if (isUploaded && isPending) {
        setIsPending(false);
        setImagePreview([]);
        setVideo("");
        setVideoPreview("");
        setSelectedImages([]);
      }
    }
  }, [currentChat]);

  return (
    <div
      className={`h-screen   w-full  relative    no-scrollbar  bg-primary-foreground ${
        currentChat ? "block" : "hidden md:block"
      }`}
    >
      {currentChat &&
      "chatHistory" in currentChat &&
      "chatInfo" in currentChat ? (
        <div className="h-full max-h-screen overflow-hidden   ">
          {/* top */}
          <div className="bg-slate-900  sticky top-0    z-20 p-2 px-4 flex items-center justify-between gap-3 ">
            <div className="flex gap-4 items-center  ">
              <div
                onClick={() => {
                  setCurrentChat(undefined);
                  setIsChatting(false);
                }}
                className="cursor-pointer hover:bg-white/20 p-0.5 md:p-2 rounded-full"
              >
                <ArrowLeft />
              </div>
              <a href={currentChat.chatInfo.profilePicture} target="_blank">
                <img
                  src={currentChat.chatInfo.profilePicture}
                  className="size-12 rounded-full object-cover"
                />
              </a>
              <div className="text-lg font-semibold tracking-wide">
                {currentChat.chatInfo.username}
              </div>
            </div>
            <div>
              <div className="md:hover:bg-white/20 transition-colors p-1 rounded-full">
                {" "}
                <MoreVertical className="size-6 cursor-pointer" />
              </div>
            </div>
          </div>
          <div
            className={`flex gap-4 flex-col p-1 px-4 h-full no-scrollbar  overflow-y-auto bg-gray-950  py-24 ${
              isPending || selectedImages.length > 0 || videoPreview
                ? "pb-64 sm:pb-72 xl:pb-[450px]"
                : ""
            } z-20`}
          >
            {currentChat.chatHistory.map(
              (his: {
                _id: string;
                from: string;
                to: string;
                createdAt: string;
                updatedAt: string;
                message: string;
                messageType: "Group" | "Personal";
                isReply?: string;
                attachedImages?: string[];
                attachedVideo?: string;
                attachedDocuments?: string[];
              }) => {
                return (
                  <DisplayChat
                    key={his._id}
                    chat={his}
                    authUserID={authUser._id}
                  />
                );
              }
            )}
            <div ref={messageRef} />
          </div>

          <div
            className={`absolute bottom-0   bg-slate-900 w-full flex flex-col justify-around   px-2 sm:px-4 ${
              isPending
                ? " pointer-events-none animate-pulse  cursor-not-allowed  "
                : ""
            } `}
          >
            {isPending ? (
              <div
                className="flex justify-center items-center p-2
            "
              >
                {isPending ? <Loading /> : ""}
              </div>
            ) : (
              ""
            )}

            {videoPreview ? (
              <div className="flex justify-center items-center flex-col ">
                <div>
                  <video
                    src={videoPreview}
                    autoPlay={true}
                    controls={true}
                    className=" max-h-72 xl:max-h-96 border aspect-video rounded-md border-white/5"
                  />
                </div>
                <div
                  className="p-1 sm:p-2 hover:bg-white/20 rounded-full flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    setVideoPreview("");
                    setVideo("");
                  }}
                >
                  <Customtooltip title="Remove">
                    <X className="size-5 sm:size-6 md:size-7 text-red-600" />
                  </Customtooltip>
                </div>{" "}
              </div>
            ) : (
              ""
            )}

            {imagePreview.length > 0 ? (
              <div className="flex pt-2 gap-2">
                {imagePreview.map((i, index) => (
                  <div
                    key={index}
                    className="size-1/4  flex  flex-col items-center gap-2 "
                  >
                    <img
                      src={i}
                      className={`rounded-md  border object-cover aspect-square w-full h-full   `}
                    />
                    <div
                      className="p-1 sm:p-2 hover:bg-white/20 rounded-full flex justify-center items-center cursor-pointer"
                      onClick={() => handlRemove(index)}
                    >
                      <Customtooltip title="Remove">
                        <X className="size-5 sm:size-6 md:size-7 text-red-600" />
                      </Customtooltip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              ""
            )}
            <div className="   flex justify-around   items-center w-full   rounded-full gap-2 sm:gap-3 md:gap-4  p-1 sm:p-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Plus className=" size-6 sm:size-7" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <div>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        className="hidden"
                        id="imageUpload"
                        multiple={true}
                        accept="images/*"
                        onChange={handleImageChange}
                      />
                      <input
                        type="file"
                        className="hidden"
                        id="videoUpload"
                        multiple={true}
                        accept="videos/*"
                        onChange={handleVideoChange}
                      />
                      <label htmlFor="imageUpload">
                        <div className="flex gap-2 cursor-pointer  text-blue-500">
                          <Image />
                          <div className="font-semibold ">Photos</div>
                        </div>
                      </label>
                      <div className="border-t "></div>
                      <label htmlFor="videoUpload">
                        <div className="flex gap-2 cursor-pointer text-blue-500">
                          <Video />
                          <div className="font-semibold ">Videos</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="w-full bg-background p-3 text-lg rounded-md  flex gap-3 sm:gap-4 items-center ">
                <Sticker className="size-7 cursor-pointer text-gray-300" />
                <TextareaAutosize
                  className=" focus:outline-none bg-transparent resize-none text-sm sm:text-base overflow-y-auto no-scrollbar  w-full"
                  placeholder="Type a message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  maxRows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim() !== "") {
                      e.preventDefault();
                      console.log(e.key);

                      handleClick();
                    }
                  }}
                />
              </div>
              {message.length === 0 ? (
                <Customtooltip title="Voice message">
                  <Mic className="size-6  text-gray-400 " />
                </Customtooltip>
              ) : (
                <SendHorizonal
                  className="size-7 text-purple-900  fill-gray-400 "
                  onClick={handleClick}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <Nomessage />
      )}
    </div>
  );
});

export default ChatBox;
