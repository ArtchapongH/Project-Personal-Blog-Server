import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.mjs";

import postRouter from "./routes/postRouter.js";
import categoryRouter from "./routes/categoryRouter.mjs";
import authRouter from "./apps/auth.js";
import profileRouter from "./apps/profileRouter.mjs";
import likeRouter from "./routes/likeRouter.js";
import commentRouter from "./routes/commentRouter.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://project-personal-blog-beige.vercel.app",
  ...(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Skip-Auth-Redirect"],
  credentials: true,
};

app.use(cors(corsOptions));

// to delete - test api
app.get("/profiles", (req, res) => {
  return res.json({
    data: {
      name: "john",
      age: 20,
    },
  });
});




// authRouter
app.use("/", authRouter);

// profileRouter
app.use("/profiles", profileRouter);

// postRouter
app.use("/posts", postRouter);
app.use("/posts", likeRouter);
app.use("/posts", commentRouter);
app.use("/likes", likeRouter);
app.use("/comments", commentRouter);

// categoryRouter
app.use("/categories", categoryRouter);





// to delete - check connection frontend to backend
app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

// to delete - check database connection
app.get("/health/db", async (req, res) => {
  try {
    await connectionPool.query("select 1");
    return res.status(200).json({ message: "DB OK" });
  } catch (error) {
    return res.status(500).json({
      message: "DB connection failed",
      error: error.message,
    });
  }
});



if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;