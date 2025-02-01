import { Request, Response } from "express";
import { hashPassword, validateEmail, verifyPassword } from "../utils";
import User from "../Models/UserModel";
import { generateToken } from "../token";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs";

interface createAccountTypes {
  username: string;
  email: string;
  password: string;
}

const defaultPics = [
  "https://res.cloudinary.com/dwxzguawt/image/upload/v1735982611/m3rwtrv8z1yfxryyoew5_iwbxdw.png",
  "https://res.cloudinary.com/dwxzguawt/image/upload/v1731396876/0861b76ad6e3b156c2b9d61feb6af864_ekjmdt.jpg",
];

const getProfilePicture = (): string => {
  const pp = Math.floor(Math.random() * defaultPics.length);
  return defaultPics[pp];
};

export const createAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password }: createAccountTypes = req.body;

    if (!username || username.trim() === "") {
      res.status(400).json({ error: "Username required!" });
      return;
    }

    if (!email || email.trim() === "") {
      res.status(400).json({ error: "Email required!" });
      return;
    }

    if (!password || password.trim() === "") {
      res.status(400).json({ error: "Password required!" });
      return;
    }

    if (username.length < 3 || username.length > 12) {
      res.status(400).json({
        error:
          "Your username must be between 3 and 12 characters long. Please try again!",
      });
      return;
    }

    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      res.status(400).json({
        error: "Invalid email format!",
      });
      return;
    }

    if (password.length < 6 || password.length > 100) {
      res.status(400).json({
        error:
          "Password must be between 6 and 100 characters long. Please choose better password!",
      });
      return;
    }

    const emailTaken = await User.exists({ email });

    if (emailTaken) {
      res
        .status(409)
        .json({ error: "Account with this email already exists!" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const pp = getProfilePicture();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture: pp,
    });

    const token = generateToken(newUser._id.toString());

    res.cookie("user", token, {
      maxAge: 1000 * 60 * 180,
    });

    await newUser.save();
    res.status(201).json({ message: "Account created!" });
  } catch (err) {
    console.error("Error in createAccount controller : ", err);
    res.status(500).json({ error: "Internal sever error!" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || email.trim() === "") {
      res.status(400).json({ error: "Email required!" });
      return;
    }

    if (!password || password.trim() === "") {
      res.status(400).json({ error: "Password required!" });
      return;
    }

    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      res.status(400).json({ error: "Invalid email format!" });
      return;
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      res
        .status(404)
        .json({ error: "Account with this email doesn't exists!" });
      return;
    }

    const passwordCorrect = await verifyPassword(password, user.password);

    if (!passwordCorrect) {
      res.status(401).json({ error: "Incorrect password!" });
      return;
    }

    const token = generateToken(user._id.toString());

    res.cookie("user", token, {
      maxAge: 1000 * 60 * 180,
    });

    res.status(200).json({ message: "Logged in successfully!" });
  } catch (err) {
    console.error("Error in login controller : ", err);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const logout = (res: Response): void => {
  try {
    res.clearCookie("user");
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error in logout controller : ", err);
    res.status(500).json({ error: "Internal sever error!" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = req.user;
    if (!userID) {
      res.status(401).json({ error: "Unauthorized!" });
      return;
    }

    const user = await User.findById(userID);

    if (!user) {
      res.status(404).json({ error: "No such user found!" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    console.log("Error in getMe controller", err);
    res.status(500).json({ error: "Internal sever error!" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, bio }: { username: string; bio: string } = req.body;
    const userID = req.user;

    let url;

    if (!username || username.trim() === "") {
      res.status(400).json({ error: "Username required!" });
      return;
    }

    if (username.length < 3 || username.length > 12) {
      res.status(400).json({
        error:
          "Your username must be between 3 and 12 characters long. Please try again!",
      });
      return;
    }

    if (!userID || userID.trim() === "") {
      res.status(400).json({ error: "Unathorized" });
      return;
    }

    const user = await User.findById(userID);

    if (!user) {
      res.status(400).json({ error: "Unathorized" });
      return;
    }

    if (bio.length > 100) {
      res.status(400).json({
        error: "Bio must not exceed 100 characetrs. Please try again!",
      });
      return;
    }

    if (req.file && req.file.path) {
      if (user.profilePicture && !defaultPics.includes(user.profilePicture)) {
        const imgID = user.profilePicture.split("/").slice(-1)[0].split(".")[0];
        const picID = `Signal/Profile-Picture/${imgID}`;
        await cloudinary.uploader.destroy(picID, {
          resource_type: "image",
        });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "Signa;/Profile-Pictures",
        });
        unlink(req.file.path, (err) => {
          if (err) console.log("Error unlinking file : ", err);
        });
        url = uploadResult.secure_url;
      } catch (err) {
        console.log("Error uploading profile picture : ", err);
        res.status(400).json({ error: "Make sure internet is ON!" });
        return;
      }
    }

    if (url) user.profilePicture = url;
    if (username) user.username = username;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully!" });
    return;
  } catch (err) {
    console.log("Error in getMe controller", err);
    res.status(500).json({ error: "Internal sever error!" });
  }
  return;
};
