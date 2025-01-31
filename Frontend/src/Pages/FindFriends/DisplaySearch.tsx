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
}

const DisplaySearch = memo(
  ({ result, authUserId, sendFriendRequest }: searchResultInterface) => {
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
        <img
          src={
            result.profilePicture ||
            "https://res.cloudinary.com/dwxzguawt/image/upload/v1735982611/m3rwtrv8z1yfxryyoew5_iwbxdw.png"
          }
          alt="Profile picture"
          className="size-12 rounded-full"
        />
        <div className="flex flex-col gap-0.5 pl-3  w-full">
          <div className="font-bold tracking-wide text-lg">
            {result.username}
          </div>
          <div className="text-[13px] sm:text-sm  text-gray-400">
            "Hey there! I'm using Signal. Let's chat!"
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
                <button className="bg-red-700  rounded-md p-1 sm:p-2 px-3 active:bg-green-500 transition-colors">
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
