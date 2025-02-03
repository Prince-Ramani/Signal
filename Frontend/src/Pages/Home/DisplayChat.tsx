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
        className={`bg-blue-700 text-lg gap-1 max-w-[75%] sm:max-w-prose flex flex-col items-center tracking-wide p-2 w-fit rounded-md  ${
          authUserID === chat.from
            ? "rounded-tr-none rounded-br-2xl ml-auto"
            : " rounded-tl-none rounded-bl-2xl mr-auto"
        } `}
      >
        <div className="break-all text-sm flex flex-col   ">
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
