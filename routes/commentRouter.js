import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/authMiddleware.js";

const commentRouter = Router();

commentRouter.use(protect);

// read all comments by post id



// create comment by post id