import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/protect.js";

const likeRouter = Router();

likeRouter.use(protect);

// read all likes by post id



// update(add) like by post id