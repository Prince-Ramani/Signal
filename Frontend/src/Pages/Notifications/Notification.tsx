import { useWebsocket } from "@/Context/Websocket";
import { memo, useEffect } from "react";
import DisplayNoti from "./DisplayNoti";
import { Star } from "lucide-react";

const Notifications = memo(() => {
  const {
    getNotifications,
    totalNotifications,
    acceptFriendRequest,
    removeFriend,
  } = useWebsocket();

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    console.log(totalNotifications);
  }, [totalNotifications]);
  return (
    <div className=" w-full    flex flex-col md:border-l md:border-r h-full bg-background   ">
      <div>
        <div className="font-bold   text-2xl  p-3 px-4">Notifications</div>
      </div>{" "}
      {totalNotifications.length === 0 ? (
        <>
          <div className=" bg-primary-foreground rounded-2xl flex justify-center items-center gap-5 mx-4 mt-10 py-20 flex-col ">
            <Star className="size-20 text-white/30" />
            <div className="text-white/30 text-xl tracking-wide">
              You have no new notifications!
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="font-medium text-gray-500 underline underline-offset-8   lg:text-xl  p-2 xl:p-4">
              Friend Requests
            </div>
          </div>
          <div>
            {totalNotifications.map(
              (noti: {
                username: string;
                bio: string;
                profilePicture: string;
                _id: string;
              }) => (
                <DisplayNoti
                  key={noti._id}
                  noti={noti}
                  acceptFriendRequest={acceptFriendRequest}
                  removeFriend={removeFriend}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default Notifications;
