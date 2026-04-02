import express from "express";
import cors from "cors";
import tutorRoutes from "./routes/tutor.routes.js";
import codeRoutes from "./routes/code.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import quizcountRoutes from "./routes/quizcount.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Learnova Backend is Running!" });
});

app.use("/api/tutor", tutorRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/resource", resourceRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizCount", quizcountRoutes);

export default app;
