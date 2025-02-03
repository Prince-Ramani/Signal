import { memo, useRef, useState } from "react";
import { ArrowLeft, Search, XIcon } from "lucide-react";
import { useWebsocket } from "@/Context/Websocket";
import DisplaySearch from "./DisplaySearch";
import { useAuthUser } from "@/Context/authUserContext";

const FindFriends = memo(() => {
  const { authUser } = useAuthUser();
  if (!authUser) return;
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { searchFriend, searchResult, sendFriendRequest, removeFriend } =
    useWebsocket();

  return (
    <div className="w-full  h-full flex select-none    ">
      <div className=" w-full    flex flex-col md:border-l md:border-r h-full  bg-background   ">
        <div className="p-2 px-2  mt-3  w-full ">
          <div className="p-2  flex items-center h-10 gap-2 bg-foreground rounded-xl cursor-pointer">
            <button className="mx-3">
              {search.length > 0 ? (
                <ArrowLeft
                  onClick={() => {
                    searchRef.current?.blur();
                    setSearch("");
                    searchFriend("");
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
              onChange={(e) => {
                setSearch(e.target.value);
                searchFriend(e.target.value);
              }}
            />
            {search.length > 0 ? (
              <XIcon
                className="text-primary-foreground"
                onClick={() => {
                  setSearch("");
                  searchFriend("");
                }}
              />
            ) : (
              ""
            )}
          </div>
        </div>
        {searchResult.length > 0 ? (
          <div
            className="
          w-full border-t  "
          >
            {searchResult.map(
              (sr: {
                username: string;
                _id: string;
                profilePicture: string;
                bio: string;
                pendingFriendRequest: string[];
                friends: string[];
              }) => (
                <DisplaySearch
                  key={sr._id}
                  result={sr}
                  authUserId={authUser._id}
                  sendFriendRequest={sendFriendRequest}
                  removeFriendRequest={removeFriend}
                />
              )
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
});

export default FindFriends;
