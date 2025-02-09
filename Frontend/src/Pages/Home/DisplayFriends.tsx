import { Image, File, Video, Check, CheckCheck } from "lucide-react";
import { memo } from "react";

interface friendInterface {
  bio: string;
  lastMessage?: string;
  profilePicture: string;
  username: string;
  wasFromMe?: boolean;
  _id: string;
  totalNewMessages: number;
  lastMessageType: "Document" | "Text" | "Image" | "Video";
  status: "Pending" | "Seen" | "Sent";
}

const DisplayFriend = memo(
  ({
    friend,
    setTotalFriends,
    getHistory,
  }: {
    friend: friendInterface;
    getHistory: any;
    setTotalFriends: any;
  }) => {
    if (!friend) return;

    return (
      <div
        className="flex gap-2 pl-2 hover:bg-border     items-center"
        onClick={() => {
          setTotalFriends((prev: any) => {
            const data = prev.map((f: any) => {
              if (f._id === friend._id) {
                return {
                  ...f,
                  status: "Seen",
                  lastMessage: "",
                  lastMessageType: "Text",
                  totalNewMessages: 0,
                };
              } else return f;
            });

            return data;
          });
          getHistory(friend._id);
        }}
      >
        <img
          className="size-14 shrink-0 object-cover select-none pointer-events-none bg-white rounded-full  "
          src={friend.profilePicture}
        />
        <div className="w-full h-20  border-t flex flex-col gap-1  justify-center   ">
          <div className="font-bold tracking-wide  ">{friend.username}</div>

          {"lastMessage" in friend &&
          (friend.lastMessage?.trim().length !== 0 ||
            friend.lastMessageType !== "Text") ? (
            <div className="flex gap-1">
              {friend.status === "Pending" ? (
                <Check />
              ) : friend.status === "Sent" ? (
                <CheckCheck />
              ) : (
                <CheckCheck className="text-blue-500" />
              )}

              {friend.lastMessage &&
              friend.lastMessage.length > 0 &&
              friend.lastMessageType ? (
                <div className="text-sm text-gray-400  tracking-wider flex gap-1 items-center w-full ">
                  {friend.lastMessageType === "Image" ? (
                    <Image className="size-4 " />
                  ) : (
                    ""
                  )}
                  {friend.lastMessageType === "Document" ? (
                    <File className="size-4" />
                  ) : (
                    ""
                  )}
                  {friend.lastMessageType === "Video" ? (
                    <Video className="size-4" />
                  ) : (
                    ""
                  )}
                  {friend.lastMessage.length > 30
                    ? friend.lastMessage.slice(0, 30) + "..."
                    : friend.lastMessage}
                  {!friend.wasFromMe && friend.totalNewMessages > 0 ? (
                    <div className="ml-auto px-2">
                      <div className="rounded-full bg-green-500 text-white size-6 flex justify-center items-center ">
                        {friend.totalNewMessages}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
);

export default DisplayFriend;
