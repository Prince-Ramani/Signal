import { Laptop, Lock } from "lucide-react";
import { memo } from "react";

const Nomessage = memo(() => {
  return (
    <div className="w-full h-full min-h-screen sticky top-0 flex justify-center  bg-primary-foreground  select-none flex-col ">
      <div className="flex flex-col justify-center   items-center gap-3">
        <Laptop className="size-24" />
        <div className="  lg:text-3xl xl:text-4xl font-bold">Signal Web</div>
        <div className="text-white/60">
          Send and receive messages without keeping your phone online.
        </div>
      </div>
      <div className=" absolute bottom-2 text-white/70 text-center  flex  items-center  justify-center w-full">
        <Lock className="size-4 " />
        <div>Your personal messages are end-to-end encrypted.</div>
      </div>
    </div>
  );
});

export default Nomessage;
