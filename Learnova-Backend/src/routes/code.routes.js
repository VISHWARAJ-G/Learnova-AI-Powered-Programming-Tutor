import express from "express";
import {
  debugCode,
  explainCode,
  generateCode,
} from "../controllers/code.controller.js";

const router = express.Router();

router.post("/debug", debugCode);
router.post("/explain", explainCode);
router.post("/generate", generateCode);

export default router;
