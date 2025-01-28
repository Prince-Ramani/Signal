import { useRef, useState } from "react";
import { ArrowLeft, Search, XIcon } from "lucide-react";
import Nomessage from "./NoMessage";

const Home = () => {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

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

  const fake = [
    {
      username: "princef",
      profilePicture: "ckldkclndcn",
      lastMessage:
        "lkcndln c c c c  c c c lkcdclkdnlckndlkcndlknclkdckdnclkdnckldnclkdncklndlckndklcnldkncdlknc c c c  c c  c c  c c ",
    },
    {
      username: "princef",
      profilePicture: "ckldkclndcn",
      lastMessage:
        "cdkvvbfvjfkvbfkjvbkfbvkbf   vkjbfvkbfkjvkjfbvkfbvkjfbvkjfkvfbvkjfb",
    },
    {
      username: "princef",
      profilePicture: "ckldkclndcn",
      lastMessage: "bvkjfbvkjfkvfbvkjfb",
    },
  ];

  return (
    <div className="w-full  h-full flex select-none    ">
      <div className=" w-full xl:w-4/12   flex border-l border-r h-full    ">
        <div className="  bg-primary-foreground w-full ">
          <div>
            <div className="font-bold   lg:text-2xl  p-2 xl:p-4">Chats</div>
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
                  className={`bg-white text-primary-foreground  rounded-2xl px-3 py-0.5 cursor-pointer `}
                >
                  {t.name}
                </div>
              );
            })}
          </div>
          <div className="py-4 cursor-pointer ">
            {fake.map((f, index) => {
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
                    <div className="text-sm text-gray-400  tracking-wider">
                      {f.lastMessage.length > 30
                        ? f.lastMessage.slice(0, 30) + "...."
                        : f.lastMessage}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="h-full w-full hidden lg:block ">
        <Nomessage />
      </div>
    </div>
  );
};

export default Home;
