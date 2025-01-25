import bcrypt from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      user: string;
    }
  }
}

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
