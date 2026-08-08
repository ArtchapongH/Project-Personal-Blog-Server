import { randomUUID } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectionPool from "../utils/db.mjs";

const authRouter = Router();
const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password || !role) {
        return res.status(400).json({
            message: "name, username, email, password and role are required"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const query = `insert into users (id, name, username, email, password, role)
        values ($1, $2, $3, $4, $5, $6)`;

        const values = [
        randomUUID(),
        name,
        username,
        email,
        hashedPassword,
        role,
        ];

        await connectionPool.query(query, values);

        return res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Register failed:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email or username already exists"
            });
        }

        return res.status(500).json({
            message: "Server could not register user"
        });
    }
    
});


// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
    try{
        const results = await connectionPool.query(
            `
            SELECT users.id, users.username, users.email, users.password, users.role, users.profile_pic
            FROM users
            WHERE users.email = $1
            `,
            [req.body.email]
        );        

        const user = results.rows[0];

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);


        if (!isValidPassword) {
            return res.status(400).json({
                message: "password not valid"
            });
        }

        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, profile_pic: user.profile_pic },
            jwtSecret, 
            {
                expiresIn: "15m"
            }
        );

        return res.json({
            message: "Login successful",
            token: token
        });
    }catch (error) {
        return res.status(500).json({
            message: `Server could not log in user because database connection`
        });
    }

});



export default authRouter;
