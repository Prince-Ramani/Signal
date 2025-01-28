import { Search } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (location.pathname === "/search" && !isFocused) setIsFocused(true);
    if (location.pathname !== "/search" && isFocused) setIsFocused(false);
  }, [location]);
  return (
    <div className="w-16  bg-primary-foreground flex items-center flex-col py-4  ">
      <div
        className={`cursor-pointer ${
          isFocused ? "bg-green-400" : " md:hover:bg-white/20 "
        } flex justify-center p-2 rounded-full w-fit h-fit`}
        onClick={() => navigate("/search")}
      >
        <Search className="size-7 shrink-0" />
      </div>
    </div>
  );
});

export default Sidebar;
