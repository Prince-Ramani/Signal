import { memo, useRef, useState } from "react";
import { ArrowLeft, Search, XIcon } from "lucide-react";
import FriendsContent from "../Home/FriendsContent";

const FindFriends = memo(() => {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="w-full  h-full flex select-none    ">
      <div className=" w-full xl:w-4/12   flex border-l border-r h-full  bg-background   ">
        <div className="p-2 px-2  mt-3  w-full ">
          <div className="p-2  flex items-center h-10 gap-2 bg-foreground rounded-xl cursor-pointer">
            <button className="mx-3">
              {search.length > 0 ? (
                <ArrowLeft
                  onClick={() => {
                    searchRef.current?.blur();
                    setSearch("");
                  }}
                  className="text-green-500 size-6 "
                />
              ) : (
                <Search
                  className="size-4 text-primary-foreground"
                  onClick={() => searchRef.current?.focus()}
                />
              )}
            </button>
            <input
              className="bg-transparent w-full text-base focus:outline-none placeholder:text-muted-foreground text-primary-foreground"
              placeholder="Search"
              ref={searchRef}
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search.length > 0 ? (
              <XIcon
                className="text-primary-foreground"
                onClick={() => setSearch("")}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <div className="h-full w-full hidden lg:block ">
        <FriendsContent />
      </div>
    </div>
  );
});

export default FindFriends;
