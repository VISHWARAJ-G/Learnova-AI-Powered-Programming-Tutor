import express from "express";
import { progressUpdate } from "../controllers/progress.controller.js";

const router = express.Router();

router.post("/update", progressUpdate);

export default router;
