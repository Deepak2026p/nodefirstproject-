import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
//secure route
router.post("/logout", verifyJWT, logoutUser);

export default router;