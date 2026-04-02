import { supabaseAdmin } from "../supabase.js";
import aiService from "../services/gemini.service.js";

export async function fetchQuiz(req, res) {
  try {
    const { lessonId, lessonTitle, domain, description, userId } = req.body;

    const { data: existingQuiz, error: existingError } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);

    if (existingError) {
      console.error("DB Check Error:", existingError);
    }

    if (existingQuiz && existingQuiz.length > 0) {
      let quiz = existingQuiz[0];

      if (!quiz.payload) {
        console.warn("⚠️ Payload missing. Regenerating quiz...");

        const regeneratedPayload = await aiService.generateQuizOrCode({
          domain: quiz.domain,
          lessonTitle: quiz.lesson_title,
          description,
        });

        const { data: updatedQuiz, error } = await supabaseAdmin
          .from("quizzes")
          .update({
            payload: regeneratedPayload,
            status: "In Progress",
          })
          .eq("id", quiz.id)
          .select()
          .single();

        if (error) throw error;

        quiz = updatedQuiz;
      }

      if (quiz.status === "Completed") {
        const { data: attemptData, error: attemptError } = await supabaseAdmin
          .from("quiz_attempts")
          .select("*")
          .eq("user_id", userId)
          .eq("quiz_id", quiz.id)
          .eq("lesson_id", lessonId)
          .single();

        if (attemptError) throw attemptError;

        return res.json({
          success: true,
          mode: "REVIEW",
          quiz,
          attempt: attemptData,
        });
      }

      return res.json({
        success: true,
        mode: "ATTEMPT",
        quiz,
      });
    }

    console.log("⚡ Generating new quiz...");
    const result = await aiService.generateQuizOrCode({
      domain,
      lessonTitle,
      description,
    });

    try {
      const { data: insertedQuiz, error: insertError } = await supabaseAdmin
        .from("quizzes")
        .insert([
          {
            user_id: userId,
            lesson_id: lessonId,
            lesson_title: lessonTitle,
            domain,
            task_type: result.task_type,
            status: "Not Started",
            payload: result,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      return res.json({
        success: true,
        mode: "ATTEMPT",
        quiz: insertedQuiz,
        attempt: null,
      });
    } catch (insertError) {
      if (insertError.code === "23505") {
        console.log(
          "⚠️ Race condition detected. Fetching the existing quiz..."
        );

        const { data: retryQuiz, error: retryError } = await supabaseAdmin
          .from("quizzes")
          .select("*")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .single();

        if (retryError) throw retryError;

        return res.json({
          success: true,
          mode: "ATTEMPT",
          quiz: retryQuiz,
          attempt: null,
        });
      }
      throw insertError;
    }
  } catch (err) {
    console.error("❌ Resource Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lesson resources",
    });
  }
}

export async function startQuiz(req, res) {
  try {
    const { quiz_id, user_id, lesson_id } = req.body;

    const { error: quizErr } = await supabaseAdmin
      .from("quizzes")
      .update({ status: "In Progress" })
      .eq("id", quiz_id)
      .eq("user_id", user_id);

    if (quizErr) throw quizErr;

    const { data: attempt } = await supabaseAdmin
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quiz_id)
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id)
      .maybeSingle();

    let finalAttempt = attempt;

    if (!attempt) {
      const { data: insertedAttempt, error: attemptErr } = await supabaseAdmin
        .from("quiz_attempts")
        .insert({
          quiz_id,
          user_id,
          lesson_id,
          attempt_number: 1,
          current_question_index: 0,
          status: "In Progress",
        })
        .select()
        .single();

      if (attemptErr) throw attemptErr;
      finalAttempt = insertedAttempt;
    }

    await supabaseAdmin
      .from("lesson_completions")
      .update({ progress: "In Progress" })
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id);

    const { data: lessonData, error: lessonError } = await supabaseAdmin
      .from("lesson_completions")
      .select("*")
      .eq("user_id", user_id);

    return res.json({
      success: true,
      attempt: finalAttempt,
      lessonData,
    });
  } catch (err) {
    console.error("START QUIZ ERROR:", err);
    return res.status(500).json({ success: false });
  }
}

export async function fetchQuizDetails(req, res) {
  const { user_id, quiz_id } = req.body;
  try {
    const { data: quizDetails, error: quizDetailsError } = await supabaseAdmin
      .from("quizzes")
      .select("payload")
      .eq("id", quiz_id)
      .eq("user_id", user_id)
      .maybeSingle();
    if (quizDetailsError) {
      throw quizDetailsError;
    }
    const { data: quizSelectedAnswers, error: quizSelectedAnswersError } =
      await supabaseAdmin
        .from("quiz_attempts")
        .select("selected_answers")
        .eq("user_id", user_id)
        .eq("quiz_id", quiz_id)
        .maybeSingle();
    if (quizSelectedAnswersError) throw quizSelectedAnswersError;
    return res.json({
      success: true,
      quizDetails,
      quizSelectedAnswers,
    });
  } catch (err) {
    console.error("FETCH QUIZ ERROR:", err);
    return res.status(500).json({ success: false });
  }
}

export async function retryQuiz(req, res) {
  try {
    const { user_id, quiz_id, lesson_id } = req.body;

    const { error } = await supabaseAdmin.rpc("retry_quiz_attempt", {
      p_user_id: user_id,
      p_quiz_id: quiz_id,
      p_lesson_id: lesson_id,
    });

    if (error) throw error;

    return res.json({
      success: true,
      mode: "ATTEMPT",
    });
  } catch (err) {
    console.error("RETRY QUIZ ERROR:", err);
    return res.status(500).json({ success: false });
  }
}
