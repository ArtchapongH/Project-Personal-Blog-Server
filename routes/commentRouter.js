import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/protect.js";

const commentRouter = Router();

commentRouter.use(protect);

// read all comments by post id



// create comment by post id