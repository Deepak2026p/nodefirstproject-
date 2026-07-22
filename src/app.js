

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: process.env.cors_origin || "http://localhost:4200",
  credentials:true
}))
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true, limit:'16kb'}));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import userRoutes from "./routes/user.routes.js";
import captchaRoutes from "./routes/captcha.routes.js"
//rout declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/captcha", captchaRoutes)

export default app;
