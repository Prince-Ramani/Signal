import { useWebsocket } from "@/Context/Websocket";
import { memo, useEffect } from "react";
import DisplayNoti from "./DisplayNoti";

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
    <div className=" w-full xl:w-4/12   flex flex-col md:border-l md:border-r h-full bg-background   ">
      <div>
        <div className="font-bold   text-2xl  p-3 px-4">Notifications</div>
      </div>{" "}
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
    </div>
  );
});

export default Notifications;
