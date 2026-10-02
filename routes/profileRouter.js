import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/protect.js";

const profileRouter = Router();

profileRouter.use(protect);

// read profile by user id


// create profile by user id


// update profile by user id