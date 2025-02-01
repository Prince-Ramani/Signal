import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/Context/authUserContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";

const Profile = memo(() => {
  const { authUser } = useAuthUser();
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
      formdata.append("bio", handleUpdate.bio);
    }

    formdata.append("username", handleUpdate.username);

    mutate(formdata);
  };
  return (
    <div className=" w-full xl:w-4/12   flex flex-col md:border-l md:border-r h-full bg-background   ">
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
            <div className={`group group-focus-within:text-blue-600 text-lg `}>
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
            onClick={handleClick}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
});

export default Profile;
