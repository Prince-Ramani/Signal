import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/Context/authUserContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Loading from "@/components/Loading";

const Profile = memo(() => {
  const { authUser } = useAuthUser();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  if (!authUser) {
    navigate("/signup");
    return;
  }

  const queryclient = useQueryClient();

  const [handleUpdate, setHandleUpdate] = useState({
    username: authUser.username,
    bio: authUser.bio,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formdata: FormData) => {
      const res = await fetch(`/api/update`, {
        method: "POST",

        body: formdata,
      });
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      if ("error" in data) return toast.error(data.error);
      toast.success(data.message);
      queryclient.invalidateQueries({ queryKey: ["authUser"] });
      setIsOpen(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileExists = e.target.files?.[0];
    if (fileExists) {
      setNewProfilePicture(fileExists);
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(fileExists);
    }
  };

  const handleClick = () => {
    if (!handleUpdate.username || handleUpdate.username.trim() === "") {
      toast.error("Username required!");
      return;
    }
    if (handleUpdate.username.length < 3 || handleUpdate.username.length > 12) {
      toast.error(
        "Your username must be between 3 and 12 characters long. Please try again!"
      );
      return;
    }

    const formdata = new FormData();
    if (newProfilePicture) {
      formdata.append("profilePicture", newProfilePicture);
    }

    if (handleUpdate.bio && handleUpdate.bio.length > 100) {
      toast.error("Bio must not exceed 100 characetrs. Please try again!");
    }

    formdata.append("bio", handleUpdate.bio);

    formdata.append("username", handleUpdate.username);

    mutate(formdata);
  };
  return (
    <>
      {isOpen ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="min-w-full h-full flex items-center justify-center pb-10    z-50  flex-col bg-blue-200/10 bg-opacity-50 ">
            <DialogTitle />
            <div className="bg-black p-3 rounded-3xl max-w-[275px] sm:max-w-[300px] md:max-w-lg w-full">
              {isPending ? (
                <div className=" absolute inset-0 z-[51] flex justify-center items-center rounded-2xl bg-blue-50/20 cursor-not-allowed">
                  <Loading />
                </div>
              ) : (
                ""
              )}
              <DialogDescription />

              <div className=" w-full  flex flex-col p-4 gap-5 ">
                <div className="lg:text-xl">
                  Are you sure you want to update your profile?!
                </div>
                <button
                  className="bg-white rounded-2xl disabled:opacity-50 cusor-pointer md:hover:opacity-90 transition-colors text-black p-2 font-semibold active:bg-green-400 active:text-white"
                  disabled={isPending}
                  onClick={handleClick}
                >
                  Update
                </button>
                <button
                  className="bg-transparent border rounded-2xl disabled:opacity-50 cusor-pointer md:hover:bg-white/20 transition-colors text-white p-2 font-semibold  active:text-white"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                >
                  Cancle
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        ""
      )}

      <div className=" w-full    flex flex-col md:border-l md:border-r h-full bg-background   ">
        <div>
          <div className="font-bold text-2xl p-4">Profile</div>
        </div>
        <div className="flex justify-center items-center ">
          <label htmlFor="imageupload">
            <div className="flex justify-center relative h-fit w-fit cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                id="imageupload"
              />
              <img
                src={imagePreview || authUser.profilePicture}
                alt="Profile picture"
                className={`object-cover size-32 md:size-40  rounded-full cursor-pointer pointer-events-none select-none `}
              />
              {imagePreview ? (
                ""
              ) : (
                <div className="absolute bg-black/20 overflow-hidden bottom-0 w-full h-7 md:h-8 flex items-center justify-center ">
                  <Camera className="size-5 md:size-7 text-white/80" />
                </div>
              )}
            </div>
          </label>
          {imagePreview ? (
            <div
              className="h-fit w-fit rounded-full p-2 md:hover:bg-white/20 cursor-pointer ml-3  "
              onClick={() => {
                setImagePreview("");
                setNewProfilePicture(null);
              }}
            >
              <X className="size-8 md:size-10    text-red-600 text-white/80 " />
            </div>
          ) : (
            ""
          )}
        </div>
        <div className=" p-2 px-5 flex flex-col  gap-4">
          <label htmlFor="username" className="cursor-pointer">
            <div className="flex flex-col gap-2 group">
              <div
                className={`group text-lg ${
                  handleUpdate.username.length > 12 ||
                  handleUpdate.username.length < 3
                    ? "text-red-800"
                    : "group-focus-within:text-blue-500 "
                }`}
              >
                Username
              </div>
              <Input
                className={`group  text-lg md:text-lg ${
                  handleUpdate.username.length > 12 ||
                  handleUpdate.username.length < 3
                    ? "text-red-800 border-red-600 focus-visible:ring-red-600"
                    : ""
                }`}
                id="username"
                value={handleUpdate.username}
                onChange={(e) =>
                  setHandleUpdate((p) => ({ ...p, username: e.target.value }))
                }
              />
            </div>
          </label>
          <label htmlFor="email" className="cursor-pointer">
            <div className="flex flex-col gap-2 group">
              <div
                className={`group group-focus-within:text-blue-600 text-lg `}
              >
                Email
              </div>
              <Input
                className={`group  text-lg md:text-lg`}
                value={authUser.email}
                readOnly={true}
                id="email"
              />
            </div>
          </label>
          <label htmlFor="bio" className="cursor-pointer">
            <div className="flex flex-col gap-2 group">
              <div
                className={`group text-lg ${
                  handleUpdate.username.length > 12 ||
                  handleUpdate.username.length < 3
                    ? "text-red-800"
                    : "group-focus-within:text-blue-500 "
                }`}
              >
                Bio
              </div>
              <TextareaAutosize
                className={`group bg-transparent border focus:outline-none focus:border-blue-600  rounded-md resize-none p-2  text-lg md:text-lg `}
                minRows={3}
                maxRows={4}
                id="bio"
                value={handleUpdate.bio}
                onChange={(e) =>
                  setHandleUpdate((p) => ({ ...p, bio: e.target.value }))
                }
              />
            </div>
          </label>

          <div className="flex justify-center items-center w-full mt-5">
            <button
              className={`bg-blue-600 p-2 w-full md:max-w-sm rounded-md cursor-pointer md:hover:opacity-90 active:bg-green-500 transition-colors  `}
              disabled={isPending}
              onClick={() => setIsOpen(true)}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export default Profile;
