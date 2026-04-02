import express from "express";
import {
  finalQuizUpdate,
  quizBackDetails,
  quizDefaultCount,
  quizNextDetails,
  quizNumberUpdate,
  quizStoreAnswers,
} from "../controllers/quizcount.controller.js";

const router = express.Router();

router.post("/get", quizDefaultCount);

router.put("/back", quizBackDetails);

router.put("/next", quizNextDetails);

router.put("/answer", quizStoreAnswers);

router.put("/number", quizNumberUpdate);

router.put("/updateFinal", finalQuizUpdate);

export default router;
