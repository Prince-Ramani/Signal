import { Hand } from "lucide-react";
import { memo, useEffect, useState } from "react";

const Connect = memo(() => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center h-screen select-none">
      <div className=" flex flex-col justify-center items-center gap-10">
        <div className="font-bold md:text-2xl xl:text-3xl tracking-wide font-mono">
          Welcome to Signal!
        </div>

        <Hand className="size-32" />
        <div className="flex gap-4 relative w-full flex-col    items-center">
          <div
            className="p-1 rounded-full w-full  bg-white 
           "
          ></div>
          <div
            className={`p-1 absolute  rounded-full  self-start z-10  bg-blue-500  transition-colors  `}
            style={{ width: `${progress}%` }}
          ></div>

          <div className="text-gray-500 max-w-prose text-center">
            "Establishing connection, please wait... We're working on getting
            everything set up. Thank you for your patience!"
          </div>
        </div>
      </div>
    </div>
  );
});

export default Connect;
