import Customtooltip from "@/components/ Customtooltip";
import { useAuthUser } from "@/Context/authUserContext";
import { Bell, MessageSquareText, Search } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentlyOn, setCurrenylOn] = useState("/");
  const { authUser } = useAuthUser();

  if (!authUser) {
    navigate("/signup");
    return;
  }

  useEffect(() => {
    setCurrenylOn(location.pathname);
  }, [location]);
  return (
    <div className="w-full    fixed md:relative  md:flex-col md:min-h-full md:w-20  bottom-0   z-50   bg-primary-foreground flex  justify-around items-center md:justify-start  py-2 md:py-4  gap-2 md:gap-4  ">
      <div
        className={`cursor-pointer ${
          currentlyOn === "/" ? "bg-green-400" : " md:hover:bg-white/20 "
        } flex justify-center p-2 rounded-full w-fit h-fit`}
        onClick={() => {
          navigate("/");
        }}
      >
        <Customtooltip title="Chats">
          <MessageSquareText className="size-7 shrink-0 " />
        </Customtooltip>
      </div>
      <div
        className={`cursor-pointer ${
          currentlyOn === "/search" ? "bg-green-400" : " md:hover:bg-white/20 "
        } flex justify-center p-2 rounded-full w-fit h-fit`}
        onClick={() => {
          navigate("/search");
        }}
      >
        <Customtooltip title="Notification">
          <Search className="size-7 shrink-0" />
        </Customtooltip>
      </div>
      <div
        className={`cursor-pointer ${
          currentlyOn === "/notifications"
            ? "bg-green-400"
            : " md:hover:bg-white/20 "
        } flex justify-center p-2 rounded-full w-fit h-fit`}
        onClick={() => {
          navigate("/notifications");
        }}
      >
        <Customtooltip title="Profile">
          <Bell className="size-7 shrink-0" />
        </Customtooltip>
      </div>
      <div
        className={`cursor-pointer ${
          currentlyOn === "/profile"
            ? "border bg-blue-400/10"
            : " md:hover:bg-white/20 "
        } flex justify-center p-2 rounded-full  w-fit h-fit`}
        onClick={() => {
          navigate("/profile");
        }}
      >
        <Customtooltip title="Profile">
          <img
            src={authUser.profilePicture}
            className="size-9 rounded-full select-none object-cover pointer-events-none  "
            alt="Profile picture"
          />
        </Customtooltip>
      </div>
    </div>
  );
});

export default Sidebar;
