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

const ChatBox = memo(() => {
  const { currentChat, sendPersonalMessage, setIsChatting, setCurrentChat } =
    useWebsocket();
  const { authUser } = useAuthUser();
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

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
      };

      setMessage("");
      setSelectedImages([]);
      setImagePreview([]);

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

  const handlRemove = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
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
          <div className="flex gap-4 flex-col p-1 px-4 h-full no-scrollbar  overflow-y-auto bg-gray-950  py-24  z-20">
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

          <div className="absolute bottom-0   bg-slate-900 w-full flex flex-col justify-around   px-2 sm:px-4 ">
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
            <div className="   flex justify-around  items-center w-full   rounded-full gap-2 sm:gap-3 md:gap-4  p-1 sm:p-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Plus className=" size-6 sm:size-7" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <div>
                    <div>
                      <input
                        type="file"
                        className="hidden"
                        id="imageUpload"
                        multiple={true}
                        accept="images/*"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="imageUpload">
                        <Image />
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
                    if (
                      (e.key === "Enter" && message.trim().length > 0) ||
                      selectedImages.length > 0
                    ) {
                      e.preventDefault();
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
