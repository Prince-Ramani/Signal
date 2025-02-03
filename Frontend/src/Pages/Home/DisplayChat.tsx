import { memo, useState } from "react";
import { FormateDate } from "@/components/Date";

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
  attachedDocuments?: string[];
}

const DisplayChat = memo(
  ({ chat, authUserID }: { chat: chatInterface; authUserID: string }) => {
    const [readMore, setReadMore] = useState(false);

    return (
      <div
        className={`bg-zinc-900 text-lg gap-0.5  max-w-[90%] sm:max-w-prose min-w-20 flex flex-col  tracking-wide p-2 w-fit rounded-md  ${
          authUserID === chat.from
            ? "rounded-tr-none rounded-br-2xl ml-auto"
            : " rounded-tl-none rounded-bl-2xl mr-auto"
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
            {chat.attachedImages.map((im: string) => {
              return (
                <img
                  src={im}
                  className={`rounded-md border object-cover aspect-square max-h-96   `}
                />
              );
            })}
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
        <div className="text-xs sm:text-sm tracking-tight self-end text-gray-300 ">
          {FormateDate(chat.createdAt)}
        </div>
      </div>
    );
  }
);

export default DisplayChat;
