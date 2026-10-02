// 🐨 Todo: Exercise #5
// สร้าง Middleware ขึ้นมา 1 อันชื่อ Function ว่า `protect`
// เพื่อเอาไว้ตรวจสอบว่า Client แนบ Token มาใน Header ของ Request หรือไม่
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let tokenWithoutBearer = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        tokenWithoutBearer = authHeader.split(" ")[1];
    }

    if (!tokenWithoutBearer && req.headers.cookie) {
        const parsedCookies = req.headers.cookie.split(";").map((cookie) => cookie.trim());
        const authCookie = parsedCookies.find((cookie) => cookie.startsWith("auth_token="));

        if (authCookie) {
            tokenWithoutBearer = authCookie.replace("auth_token=", "");
        }
    }

    if (!tokenWithoutBearer) {
        return res.status(401).json({
            message: "Token has invalid format"
        });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

    if (!jwtSecret) {
        return res.status(500).json({
            message: "JWT secret is not configured"
        });
    }

    jwt.verify(tokenWithoutBearer, jwtSecret, (err, payload) => {

        if(err){
            return res.status(401).json({
                message: "Token is invalid"
            });
        }

        req.user = payload;
        next();
    });
};