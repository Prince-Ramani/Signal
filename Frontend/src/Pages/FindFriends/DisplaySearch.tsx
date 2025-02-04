import { memo, useState } from "react";

interface searchResultInterface {
  result: {
    username: string;
    _id: string;
    profilePicture: string;
    bio: string;
    pendingFriendRequest: string[];
    friends: string[];
  };
  authUserId: string;
  sendFriendRequest: (id: string) => void;
  removeFriendRequest: (id: string) => void;
}

const DisplaySearch = memo(
  ({
    result,
    authUserId,
    sendFriendRequest,
    removeFriendRequest,
  }: searchResultInterface) => {
    const [pendingRequest, setPendingRequest] = useState(
      result.pendingFriendRequest.includes(authUserId)
    );
    const [isFriends, setIsFriends] = useState(
      result.friends.includes(authUserId)
    );

    return (
      <div
        className={` flex  items-center p-2 border-b md:hover:bg-white/20 cursor-pointer`}
      >
        <a href={result.profilePicture} target="_blank">
          <img
            src={result.profilePicture}
            alt="Profile picture"
            className="size-12 rounded-full object-cover"
          />
        </a>
        <div className="flex flex-col gap-0.5 pl-3  w-full">
          <div className="font-bold tracking-wide text-lg">
            {result.username}
          </div>
          <div className="text-[13px] sm:text-sm  text-gray-400">
            {result.bio.length > 50
              ? result.bio.slice(0, 30) + "...."
              : result.bio}
          </div>
        </div>

        {authUserId === result._id ? (
          ""
        ) : (
          <>
            {pendingRequest ? (
              <div className="ml-auto">
                <button className="bg-gray-600  rounded-md p-1 sm:p-2 px-3 active:bg-green-500 transition-colors">
                  Requested
                </button>
              </div>
            ) : (
              ""
            )}

            {!isFriends && !pendingRequest ? (
              <div className="ml-auto">
                <button
                  className="bg-blue-600  rounded-md p-1 sm:p-2 px-3 active:bg-green-500 transition-colors"
                  onClick={() => {
                    sendFriendRequest(result._id);
                    setPendingRequest(true);
                  }}
                >
                  Add
                </button>
              </div>
            ) : (
              ""
            )}

            {isFriends ? (
              <div className="ml-auto">
                <button
                  className="bg-red-700  rounded-md p-1 sm:p-2 px-3 active:bg-green-500 transition-colors"
                  onClick={() => {
                    removeFriendRequest(result._id);
                    setIsFriends(false);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              ""
            )}
          </>
        )}
      </div>
    );
  }
);

export default DisplaySearch;
