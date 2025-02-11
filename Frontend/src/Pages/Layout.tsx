import Wrapper from "@/components/Wrapper";
import { Outlet } from "react-router-dom";
import Sidebar from "./Home/sidebar";

import ChatBox from "./Home/ChatBox";
import { useWebsocket } from "@/Context/Websocket";
import VideoCall from "./VideoCall/VideoCall";

const Layout = () => {
  const { isChatting, isOnCall } = useWebsocket();

  return (
    <Wrapper className="bg-gray-800  h-full ">
      {isOnCall ? (
        <VideoCall />
      ) : (
        <>
          <div className={`${isChatting ? "hidden md:block" : " md:block"}`}>
            {" "}
            <Sidebar />
          </div>
          <div
            className={`  md:w-2/5  min-h-full  md:pb-0 ${
              isChatting ? "hidden md:block " : "w-full block"
            } `}
          >
            <Outlet />
          </div>
          <ChatBox />
        </>
      )}
    </Wrapper>
  );
};

export default Layout;
