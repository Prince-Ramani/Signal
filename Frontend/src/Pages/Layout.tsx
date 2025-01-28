import Wrapper from "@/components/Wrapper";
import { Outlet } from "react-router-dom";
import Sidebar from "./Home/sidebar";

const Layout = () => {
  return (
    <Wrapper className="bg-gray-800">
      <Sidebar />
      <div className=" w-full xl:w-full min-h-full  ">
        <Outlet />
      </div>
    </Wrapper>
  );
};

export default Layout;
