import JWT, { JwtPayload } from "jsonwebtoken";

export const generateToken = (userID: string) => {
  if (!process.env.JWT_SECRET_KEY) {
    console.log("JWT key not found!");
    process.exit(1);
  }

  const token = JWT.sign({ userID }, process.env.JWT_SECRET_KEY);
  return token;
};

export const validateToken = (token: string): string | null => {
  if (!process.env.JWT_SECRET_KEY) {
    console.log("JWT key not found!");
    process.exit(1);
  }

  try {
    let decoded = JWT.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload;
    return decoded.userID;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
};
