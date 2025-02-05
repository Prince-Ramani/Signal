import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs";

declare global {
  namespace Express {
    interface Request {
      user: string;
    }
  }
}

const imageFolder = "Signal/Images";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isVerified = await bcrypt.compare(password, hashedPassword);
  return isVerified;
};

export const uploadImageToClodinary = async (
  base64Image: string
): Promise<string> => {
  try {
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
      folder: imageFolder,
    });

    return uploadResult.secure_url;
  } catch (err) {
    console.log("error uplaoding image  : ", err);
    return "";
  }
};
