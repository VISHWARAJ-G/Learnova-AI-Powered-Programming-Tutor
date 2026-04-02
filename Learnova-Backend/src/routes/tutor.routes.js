import express from "express";
import {
  loadHistory,
  saveMessage,
  teachLesson,
} from "../controllers/tutor.controller.js";

const router = express.Router();

router.post("/teach", teachLesson);

router.post("/save-message", saveMessage);

router.post("/load-history", loadHistory);

export default router;
