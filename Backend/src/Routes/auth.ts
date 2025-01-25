import { Router } from "express";
import {
  createAccount,
  getMe,
  loginUser,
  logout,
} from "../Controllers/authControllers";
import { protectRoute } from "../Middlewares/protectRoute";

const router = Router();

router.post("/sign-up", createAccount);

router.post("/sign-in", loginUser);

router.post("/logout", logout);

router.get("/me", protectRoute, getMe);

export default router;
