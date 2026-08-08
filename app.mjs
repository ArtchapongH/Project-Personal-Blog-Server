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

// ✅ ใส่ CORS ตรงนี้ (หลังสร้าง app และก่อน routes)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Frontend local (Vite)
      "http://localhost:3000", // Frontend local (React แบบอื่น)
      "https://your-frontend.vercel.app", // Frontend ที่ Deploy แล้ว
      // ✅ ให้เปลี่ยน https://your-frontend.vercel.app เป็น URL จริงของ Frontend ที่ deploy แล้ว
    ],
  })
);

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