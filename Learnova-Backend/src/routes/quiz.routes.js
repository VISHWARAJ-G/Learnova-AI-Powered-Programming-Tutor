import express from "express";
import {
  fetchQuiz,
  fetchQuizDetails,
  retryQuiz,
  startQuiz,
} from "../controllers/quiz.controller.js";

const router = express.Router();

router.post("/fetch", fetchQuiz);

router.post("/start", startQuiz);

router.post("/quiz-details", fetchQuizDetails);

router.post("/retry", retryQuiz);

export default router;
