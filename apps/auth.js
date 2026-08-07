import { Router } from "express";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
    
    const newUser = req.body;

    const salt = await bcrypt.genSalt(10);

    newUser.password = await bcrypt.hash(newUser.password, salt);

    try {
        const query = `insert into users (name, username, email, password, role)
        values ($1, $2, $3, $4, $5)`;

        const values = [
        newUser.name,
        newUser.username,
        newUser.email,
        newUser.password,
        newUser.role,
        ];

        await connectionPool.query(query, values);

        return res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: `Server could not register user because database connection`
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

        if (!results.rows[0].email) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        const isValidPassword = await bcrypt.compare(req.body.password, results.rows[0].password);


        if (!isValidPassword) {
            return res.status(400).json({
                message: "password not valid"
            });
        }

        const token = jwt.sign(
            { id: results.rows[0].id, username: results.rows[0].username, role: results.rows[0].role, profile_pic: results.rows[0].profile_pic },
            process.env.SECRET_KEY, 
            {
                expiresIn: "900000"
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
