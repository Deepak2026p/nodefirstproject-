// import express from "express";
// import { query } from "./db/index.js";

// const app = express();

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// // Health check that also verifies the database is reachable.
// app.get("/health", async (_req, res) => {
//   try {
//     await query("SELECT 1");
//     res.status(200).json({ status: "ok", db: "up" });
//   } catch (err) {
//     res.status(503).json({ status: "error", db: "down", message: err.message });
//   }
// });

// export default app;

// custom code

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
//rout declaration
app.use("/api/v1/users", userRoutes);

export default app;
