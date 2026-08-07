import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/authMiddleware.js";

const likeRouter = Router();

likeRouter.use(protect);

// read all likes by post id



// update(add) like by post id