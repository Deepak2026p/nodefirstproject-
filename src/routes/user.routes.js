import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken  } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
//secure route
router.post("/logout", verifyJWT, logoutUser);
router.post('/refresh_token', refreshAccessToken )

export default router;