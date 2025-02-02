import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Search, XIcon } from "lucide-react";
import Nomessage from "./NoMessage";
import { useWebsocket } from "@/Context/Websocket";

const Home = () => {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { getFriends, totalFriends } = useWebsocket();
  const [searchedFriend, setSearchedFriend] = useState<any[]>([]);
  const [currentlyOn, setCurrenylOn] = useState<
    "All" | "Unread" | "Groups" | "Favourites"
  >("All");

  const tabs = [
    {
      name: "All",
    },
    {
      name: "Unread",
    },
    {
      name: "Groups",
    },
    {
      name: "Favourites",
    },
  ];

  useEffect(() => {
    getFriends();
  }, []);

  useEffect(() => {
    const result = totalFriends.filter((f) =>
      f.username.toLowerCase().startsWith(search.toLocaleLowerCase())
    );
    setSearchedFriend(result);
  }, [search]);

  return (
    <div className="w-full  h-full flex select-none    ">
      <div className=" w-full xl:w-4/12   flex md:border-l md:border-r h-full     ">
        <div className="  bg-background w-full ">
          <div className="h-12  flex items-center   bg-background  z-20  backdrop-blur-3xl      sticky top-0 px-2 gap-4 ">
            {" "}
            <div className="font-bold    text-2xl  py-3 px-4">Chats</div>
          </div>

          {/*Search*/}
          <div className="p-2 px-2  ">
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
                className="bg-transparent text-primary-foreground w-full text-base focus:outline-none placeholder:text-muted-foreground"
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

          {/*Tabs*/}
          <div className=" flex gap-2 px-3">
            {tabs.map((t, index) => {
              return (
                <div
                  key={index}
                  className={` text-primary-foreground ${
                    currentlyOn === t.name
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }  rounded-2xl px-3 py-0.5 cursor-pointer `}
                  onClick={() => {
                    //@ts-ignore
                    setCurrenylOn(t.name);
                  }}
                >
                  {t.name}
                </div>
              );
            })}
          </div>
          {search.length === 0 ? (
            <div className="py-4 cursor-pointer ">
              {totalFriends.map((f, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-2 pl-2 hover:bg-border     items-center"
                  >
                    <div className="border border-transparent">
                      <div className="w-14 h-14 bg-white rounded-full pl-2 py-2  "></div>
                    </div>
                    <div className="w-full h-20  border-t flex flex-col  justify-center   ">
                      <div className="font-bold tracking-wide  ">
                        {f.username}
                      </div>
                      {/* <div className="text-sm text-gray-400  tracking-wider">
                        {f.lastMessage.length > 30
                          ? f.lastMessage.slice(0, 30) + "...."
                          : f.lastMessage}
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 cursor-pointer ">
              {searchedFriend.map((f, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-2 pl-2 hover:bg-border     items-center"
                  >
                    <div className="border border-transparent">
                      <div className="w-14 h-14 bg-white rounded-full pl-2 py-2  "></div>
                    </div>
                    <div className="w-full h-20  border-t flex flex-col  justify-center   ">
                      <div className="font-bold tracking-wide">
                        {f.username
                          .toLowerCase()
                          .split("")
                          .map((s: string, index: number) =>
                            search.toLocaleLowerCase().includes(s) ? (
                              <span
                                className="font-extrabold text-green-400"
                                key={index}
                              >
                                {s}
                              </span>
                            ) : (
                              s
                            )
                          )}
                      </div>
                      {/* <div className="text-sm text-gray-400  tracking-wider">
                      {f.lastMessage.length > 30
                        ? f.lastMessage.slice(0, 30) + "...."
                        : f.lastMessage}
                    </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="h-full w-full hidden lg:block ">
        <Nomessage />
      </div>
    </div>
  );
};

export default Home;
