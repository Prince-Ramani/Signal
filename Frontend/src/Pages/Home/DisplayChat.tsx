import { memo, useEffect, useState } from "react";
import { FormateDate } from "@/components/Date";
import { Check, CheckCheck, Download, File } from "lucide-react";

interface chatInterface {
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
  attachedDocuments?: { name: string; doc: string }[];
  status: "Pending" | "Seen" | "Sent";
}

const DisplayChat = memo(
  ({
    chat,
    authUserID,
    isDeleteOn,
    setSelectedMessages,
  }: {
    chat: chatInterface;
    authUserID: string;
    setSelectedMessages: any;
    isDeleteOn: boolean;
  }) => {
    const [readMore, setReadMore] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
      setIsSelected(false);
    }, [isDeleteOn]);

    return (
      <div
        className={`w-full  rounded-md  py-2 ${
          isSelected ? "bg-white/20 px-2" : ""
        } ${isDeleteOn ? "cursor-pointer " : ""} `}
        onClick={() => {
          if (isDeleteOn && !isSelected) {
            setIsSelected(true);
            setSelectedMessages((prev: string[]) => [...prev, chat._id]);
          }

          if (isDeleteOn && isSelected) {
            setIsSelected(false);
            setSelectedMessages((prev: string[]) => [
              prev.filter((p) => p !== chat._id),
            ]);
          }
        }}
      >
        <div
          className={` text-lg gap-0.5  bg-gray-800  max-w-[90%] sm:max-w-prose min-w-20 md:min-w-40 flex flex-col   tracking-wide p-2 w-fit rounded-md  ${
            authUserID === chat.from
              ? "rounded-tr-none rounded-br-2xl  ml-auto"
              : " rounded-tl-none rounded-bl-2xl  mr-auto"
          } `}
        >
          {chat.attachedImages && chat.attachedImages.length > 0 ? (
            <div
              className={`grid gap-2 mb-4  ${
                chat.attachedImages.length === 2
                  ? " grid-cols-2   "
                  : chat.attachedImages.length === 3
                  ? "grid-cols-2  "
                  : ""
              }`}
            >
              {chat.attachedImages.map((im: string, index) => {
                return (
                  <a href={im} target="_blank" key={index}>
                    <img
                      src={im}
                      className={`rounded-md border object-cover aspect-square max-h-96   `}
                    />
                  </a>
                );
              })}
            </div>
          ) : (
            ""
          )}

          {chat.attachedVideo ? (
            <div>
              <video
                src={chat.attachedVideo}
                controls={true}
                preload="metadata"
                className="max-w-full mt-1 border aspect-video rounded-md mb-3 bg-black object-cover"
              />
            </div>
          ) : (
            ""
          )}

          {chat.attachedDocuments && chat.attachedDocuments.length > 0 ? (
            <div className="flex justify-center items-center  rounded-full mb-2">
              {chat.attachedDocuments.map((doc, index) => (
                <a href={doc.doc} download={doc.name} key={index}>
                  <div
                    className="flex gap-2 justify-center items-center text-red-600 rounded-full border md:border-2 border-red-600 p-2 md:p-3 md:hover:text-red-500 md:hover:bg-white/10 active:bg-green-500 transition-colors  "
                    key={index}
                  >
                    <File className="size-6 shrink-0" />
                    <div className="break-all text-sm sm:text-base font-semibold ">
                      {doc.name}
                    </div>
                    <div>
                      <Download className="shrink-0 " />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            ""
          )}

          <div className="break-all text-sm sm:text-base  sm:tracking-wide flex flex-col   ">
            {chat.message.length > 768 && !readMore ? (
              <>
                {chat.message.slice(0, 769)}
                <span
                  className="ml-auto text-green-400 font-semibold cursor-pointer md:hover:text-gray-300"
                  onClick={() => setReadMore(true)}
                >
                  Read More...
                </span>
              </>
            ) : (
              chat.message
            )}
          </div>
          <div className="text-xs sm:text-sm tracking-tight self-end flex gap-2 items-center text-gray-300 pb-1 ">
            {FormateDate(chat.createdAt)}

            {chat.from !== authUserID ? (
              <CheckCheck className="text-blue-500 size-5" />
            ) : chat.status === "Pending" ? (
              <Check className="size-5" />
            ) : chat.status === "Sent" ? (
              <CheckCheck className="size-5" />
            ) : (
              <CheckCheck className="text-blue-500 size-5" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default DisplayChat;
