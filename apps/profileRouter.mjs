import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import connectionPool from "../utils/db.mjs";
import { protect } from "../middlewares/protect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabaseClient = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

const multerUpload = multer({ storage: multer.memoryStorage() });
const imageFileUpload = multerUpload.single("imageFile");

const profileRouter = Router();

// get user profile by id
profileRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 2) เขียน Query เพื่ออ่านข้อมูลโพสต์ ด้วย Connection Pool
    const results = await connectionPool.query(
      `
      SELECT id, name, username, profile_pic, email
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    // เพิ่ม Conditional logic ว่าถ้าข้อมูลที่ได้กลับมาจากฐานข้อมูลเป็นค่า false (null / undefined)
    if (!results.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested user (user id: ${id})`,
      });
    }

    // 3) Return ตัว Response กลับไปหา Client
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: `Server could not get user data because database issue`,
    });
  }

});

// update user password by id
profileRouter.put("/:id/password", async (req, res) => {
  const userId = req.params.id ?? req.user?.id;
  const { password } = req.body;

  try{
    if (!password) {
        return res.status(400).json({
            message: "No password to update provided"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      UPDATE users
      SET password = $1
      WHERE id = $${userId}
    `;

    await connectionPool.query(query, [hashedPassword]);

    return res.status(200).json({ message: "Password updated successfully" });

  }catch(err){
    return res.status(500).json({
      message: "Failed to update password",
    });
  }
});


// update user profile by id
profileRouter.put("/:id", [protect, imageFileUpload], async (req, res) => {
  const userId = req.params.id ?? req.user?.id;
  const { name, username} = req.body;
  const file = req.file;

  let profilePicUrl = null;

  try {
    if (file) {
      if (supabaseClient) {
        try {
          const bucketName = "my-personal-blog";
          const filePath = `profiles/${userId}-${Date.now()}`;

          const { data, error } = await supabaseClient.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (error) {
            throw new Error("Failed to upload profile picture to storage");
          }

          const {
            data: { publicUrl },
          } = supabaseClient.storage.from(bucketName).getPublicUrl(data.path);

          profilePicUrl = publicUrl;
        } catch (uploadError) {
          throw new Error(uploadError.message || "Failed to upload profile picture to storage");
        }
      } else {
        profilePicUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      }
    }

    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      fieldsToUpdate.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (username) {
      fieldsToUpdate.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (profilePicUrl) {
      fieldsToUpdate.push(`profile_pic = $${paramIndex++}`);
      values.push(profilePicUrl);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: "No fields to update provided" });
    }

    values.push(userId);

    const query = `
      UPDATE users
      SET ${fieldsToUpdate.join(", ")}
      WHERE id = $${paramIndex}
    `;

    await connectionPool.query(query, values);

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update profile",
      error: err.message,
    });
  }
});

export default profileRouter;