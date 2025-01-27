import Wrapper from "@/components/Wrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signin = memo(() => {
  const queryclient = useQueryClient();
  const navigate = useNavigate();
  const [info, setInfo] = useState({
    email: "",
    password: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      });
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      if ("error" in data) return toast.error(data.error);
      toast.success(data.message);
      queryclient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = () => {
    if (!info.email || info.email.trim() === "") {
      toast.error("Email required!");
      return;
    }

    if (!info.password || info.password.trim() === "") {
      toast.error("Password required!");
      return;
    }

    mutate();
  };

  return (
    <Wrapper>
      <div className=" sm:items-center w-full flex flex-col gap-4 p-4 sm:justify-center  ">
        <div className="flex flex-col   p-2 w-full max-w-xl">
          <div className="  font-semibold text-4xl xl:text-5xl py-2  lg:py-4  ">
            Sign in
          </div>
          <div className="flex gap-3 xl:gap-4 flex-col  p-2  ">
            <label
              htmlFor="email"
              className="h-full w-full flex flex-col gap-2 group cursor-pointer"
            >
              <div className=" text-lg xl:text-xl group text-neutral-300  group-focus-within:text-white  ">
                Email :
              </div>
              <input
                id="email"
                className="bg-transparent rounded-md border-2 focus:bg-white/10 border-neutral-300 p-2 text-lg xl:text-xl focus:outline-none placeholder:text-base placeholder:text-gray-300 focus:border-white focus:text-white focus:placeholder:text-white text-neutral-300 "
                placeholder="Email"
                value={info.email}
                onChange={(e) =>
                  setInfo((p) => ({ ...p, email: e.target.value }))
                }
              />
            </label>
            <label
              htmlFor="password"
              className="h-full w-full flex flex-col gap-2 group cursor-pointer"
            >
              <div className=" text-lg xl:text-xl group text-neutral-300  group-focus-within:text-white  ">
                Password :
              </div>
              <input
                id="password"
                className="bg-transparent rounded-md border-2 focus:bg-white/10 border-neutral-300 p-2 text-lg xl:text-xl focus:outline-none placeholder:text-base placeholder:text-gray-300 focus:border-white focus:text-white focus:placeholder:text-white text-neutral-300 "
                placeholder="Password"
                value={info.password}
                onChange={(e) =>
                  setInfo((p) => ({ ...p, password: e.target.value }))
                }
              />
            </label>
            <div className="flex flex-col gap-2 justify-center mt-4 items-center">
              <button
                className="bg-white text-black font-medium w-full p-2 max-w-xl  md:hover:bg-white/90 disabled:bg-gray-300  rounded-md text-lg"
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? "Signing in..." : "Sign in"}{" "}
              </button>
              <div
                className="md:text-lg self-start font-medium md:hover:text-gray-200 cursor-pointer md:hover:underline"
                onClick={() => {
                  if (isPending) return;
                  navigate("/signup");
                }}
              >
                Dont' have an account? Sign up
              </div>
              <button
                className="bg-white text-black font-medium w-full p-2 max-w-xl  md:hover:bg-white/90 disabled:bg-gray-300  rounded-md text-lg"
                disabled={isPending}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
});

export default Signin;
