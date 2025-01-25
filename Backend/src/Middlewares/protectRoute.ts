import { NextFunction, Request, Response } from "express";
import { validateToken } from "../token";

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await req.cookies["user"];

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }
    const userID: string | null = validateToken(token);

    if (!userID || typeof userID !== "string") {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    req.user = userID;

    if (!req.user && req.user !== undefined) {
      res.status(401).json({ error: "Unauthorized!" });
      return;
    }

    next();
  } catch (err) {
    console.log("Error in  protectRoute middleware : ", err);
    res.status(500).json("Internal server error!");
  }
};
