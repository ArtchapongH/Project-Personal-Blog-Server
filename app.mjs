import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.mjs";

import postRouter from "./routes/postRouter.js";
import authRouter from "./apps/auth.js";
import profileRouter from "./apps/profileRouter.mjs";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://your-frontend.vercel.app",
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
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

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



// check server is running
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectionPool
  .query("select 1")
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });