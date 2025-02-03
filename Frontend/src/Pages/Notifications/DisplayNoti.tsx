import { memo, useState } from "react";

const DisplayNoti = memo(
  ({
    noti,
    acceptFriendRequest,
    removeFriend,
  }: {
    noti: {
      username: string;
      bio: string;
      profilePicture: string;
      _id: string;
    };

    acceptFriendRequest: (id: string) => void;
    removeFriend: (id: string) => void;
  }) => {
    const [isFriends, setIsFriends] = useState(false);

    return (
      <div
        className={` flex  items-center p-2 border-b md:hover:bg-white/20 cursor-pointer`}
      >
        <img
          src={
            noti.profilePicture ||
            "https://res.cloudinary.com/dwxzguawt/image/upload/v1735982611/m3rwtrv8z1yfxryyoew5_iwbxdw.png"
          }
          alt="Profile picture"
          className="size-12 rounded-full"
        />
        <div className="flex flex-col gap-0.5 pl-3  w-full">
          <div className="font-bold tracking-wide text-lg">{noti.username}</div>
          <div className="text-[13px] sm:text-sm  text-gray-400">
            {noti.bio.length > 50 ? noti.bio.slice(0, 30) + "...." : noti.bio}
          </div>
        </div>
        <div className="ml-auto">
          <button
            className={`${
              isFriends ? "bg-red-600" : "bg-blue-700"
            } select-none  rounded-md p-1 sm:p-2 px-3 active:bg-green-500 transition-colors`}
            onClick={() => {
              if (!isFriends) {
                acceptFriendRequest(noti._id);
                setIsFriends(true);
              } else {
                removeFriend(noti._id);
                setIsFriends(false);
              }
            }}
          >
            {isFriends ? "Remove" : "Accept"}
          </button>
        </div>
      </div>
    );
  }
);

export default DisplayNoti;
