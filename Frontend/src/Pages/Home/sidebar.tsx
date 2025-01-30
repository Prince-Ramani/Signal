import Customtooltip from "@/components/ Customtooltip";
import { MessageSquareText, Search } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentlyOn, setCurrenylOn] = useState("/");

  useEffect(() => {
    setCurrenylOn(location.pathname);
  }, [location]);
  return (
    <div className="w-16  bg-primary-foreground flex items-center flex-col py-4  gap-4  ">
      <div
        className={`cursor-pointer ${
          currentlyOn === "/" ? "bg-green-400" : " md:hover:bg-white/20 "
        } flex justify-center p-2 rounded-full w-fit h-fit`}
        onClick={() => {
          navigate("/");
        }}
      >
        <Customtooltip title="Chats">
          <MessageSquareText className="size-6 shrink-0 " />
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
        <Customtooltip title="Search">
          <Search className="size-7 shrink-0" />
        </Customtooltip>
      </div>
    </div>
  );
});

export default Sidebar;
