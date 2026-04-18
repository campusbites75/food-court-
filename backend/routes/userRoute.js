import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import googleLoginUser from "../controllers/googleLoginController.js";

const userRouter = express.Router();

// NORMAL LOGIN / REGISTER
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// GOOGLE LOGIN
userRouter.post("/google-login", googleLoginUser);

export default userRouter;
