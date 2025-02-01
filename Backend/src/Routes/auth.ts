import { Router } from "express";
import {
  createAccount,
  getMe,
  loginUser,
  logout,
  updateProfile,
} from "../Controllers/authControllers";
import { protectRoute } from "../Middlewares/protectRoute";
import upload from "../Cloudinary";

const router = Router();

router.post("/sign-up", createAccount);

router.post("/sign-in", loginUser);

router.post("/logout", logout);
router.post(
  "/update",
  upload.single("profilePicture"),
  protectRoute,
  updateProfile
);

router.get("/me", protectRoute, getMe);

export default router;
