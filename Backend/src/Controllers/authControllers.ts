import { Request, Response } from "express";
import { hashPassword, validateEmail, verifyPassword } from "../utils";
import User from "../Models/UserModel";
import { generateToken } from "../token";

interface createAccountTypes {
  username: string;
  email: string;
  password: string;
}

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

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
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
