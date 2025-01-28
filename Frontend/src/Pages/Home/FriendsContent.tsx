import { Handshake, Lock } from "lucide-react";
import { memo } from "react";

const FriendsContent = memo(() => {
  return (
    <div className="w-full h-full flex justify-center relative bg-primary-foreground  select-none flex-col ">
      <div className="flex flex-col justify-center   items-center gap-3">
        <Handshake className="size-24" />
        <div className="  lg:text-3xl xl:text-4xl font-bold">Find Friends</div>
        <div className="text-white/60 max-w-prose text-center">
          Discover new friends, chat, and connect through voice or video calls
          all in one place! Search for people by interests, location, and more,
          then start messaging or video chatting instantly. Make meaningful
          connections anytime, anywhere.
        </div>
      </div>
      <div className=" absolute bottom-2 text-white/70 text-center flex  items-center  justify-center w-full">
        <Lock className="size-4 " />
        <div> Your personal messages are end-to-end encrypted.</div>
      </div>
    </div>
  );
});

export default FriendsContent;
