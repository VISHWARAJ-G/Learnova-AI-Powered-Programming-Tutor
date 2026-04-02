import { supabaseAdmin } from "../supabase.js";

export async function quizDefaultCount(req, res) {
  const { quiz_id, user_id, lesson_id } = req.body;
  const { data: existingQuiz, error: existingError } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();

  if (existingError) throw existingError;
  return res.json({ success: true, quizProgressDetails: existingQuiz });
}

export async function quizNextDetails(req, res) {
  const { quiz_id, user_id, lesson_id, questionNo } = req.body;
  const { error: updateError } = await supabaseAdmin
    .from("quiz_attempts")
    .update({ current_question_index: questionNo })
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id);
  if (updateError) throw updateError;
  const { data: newUpdatedData, error: fetchError } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  return res.json({ success: true, quizProgressDetails: newUpdatedData });
}

export async function quizBackDetails(req, res) {
  const { quiz_id, user_id, lesson_id, questionNo } = req.body;
  const { error: updateError } = await supabaseAdmin
    .from("quiz_attempts")
    .update({ current_question_index: questionNo })
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id);
  if (updateError) throw updateError;
  const { data: newUpdatedData, error: fetchError } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  return res.json({ success: true, quizProgressDetails: newUpdatedData });
}

export async function quizNumberUpdate(req, res) {
  const { quiz_id, user_id, lesson_id, questionNo } = req.body;
  const { error: updateError } = await supabaseAdmin
    .from("quiz_attempts")
    .update({ current_question_index: questionNo })
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id);
  if (updateError) throw updateError;
  const { data: newUpdatedData, error: fetchError } = await supabaseAdmin
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  return res.json({ success: true, quizProgressDetails: newUpdatedData });
}

export async function quizStoreAnswers(req, res) {
  const { quiz_id, user_id, lesson_id, questionIndex, selectedOption } =
    req.body;
  const { data: attempt, error: fetchErr } = await supabaseAdmin
    .from("quiz_attempts")
    .select("selected_answers")
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  const updatedAnswers = attempt?.selected_answers || {};
  updatedAnswers[questionIndex] = selectedOption;

  const { data, error: updateErr } = await supabaseAdmin
    .from("quiz_attempts")
    .update({
      selected_answers: updatedAnswers,
    })
    .eq("quiz_id", quiz_id)
    .eq("user_id", user_id)
    .eq("lesson_id", lesson_id)
    .select()
    .single();

  if (updateErr) throw updateErr;

  return res.json({ success: true, answers: data.selected_answers });
}

export async function finalQuizUpdate(req, res) {
  try {
    const { quiz_id, user_id, correctCount, lesson_id } = req.body;

    console.log("finalQuizUpdate payload:", req.body);

    if (!quiz_id || !user_id || !lesson_id) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid quiz_id, user_id, or lesson_id",
      });
    }

    const { data: lessonRow, error: lessonFetchError } = await supabaseAdmin
      .from("lesson_completions")
      .select("completed, domain, contribution_percentage")
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id)
      .maybeSingle();

    if (lessonFetchError) throw lessonFetchError;

    if (lessonRow && lessonRow.completed === false) {
      const { data: existingProgress, error: fetchProgressError } =
        await supabaseAdmin
          .from("progress")
          .select("completion_percentage")
          .eq("user_id", user_id)
          .eq("domain", lessonRow.domain)
          .maybeSingle();

      if (fetchProgressError) throw fetchProgressError;

      const newValue =
        (existingProgress?.completion_percentage || 0) +
        lessonRow.contribution_percentage;

      const { error: progressError } = await supabaseAdmin
        .from("progress")
        .upsert(
          {
            user_id,
            domain: lessonRow.domain,
            completion_percentage: newValue,
          },
          { onConflict: ["user_id", "domain"] }
        );

      if (progressError) throw progressError;
    }

    const { data: quiz_attempt_data, error } = await supabaseAdmin
      .from("quiz_attempts")
      .update({
        current_question_index: 0,
        status: "Completed",
        score: correctCount,
        is_passed: correctCount >= 5,
      })
      .eq("user_id", user_id)
      .eq("quiz_id", quiz_id)
      .eq("lesson_id", lesson_id)
      .select("*");

    if (error) throw error;

    const { data: quizzes_data, error: errorAtQuizzes } = await supabaseAdmin
      .from("quizzes")
      .update({ status: "Completed" })
      .eq("user_id", user_id)
      .eq("id", quiz_id)
      .select("*");

    if (errorAtQuizzes) throw errorAtQuizzes;

    const { data: lesson_completion_data, error: lessonUpdateError } =
      await supabaseAdmin
        .from("lesson_completions")
        .update({ progress: "Completed", completed: true })
        .eq("user_id", user_id)
        .eq("lesson_id", lesson_id)
        .select("*");

    if (lessonUpdateError) throw lessonUpdateError;

    const { data: lessonProgress, error: lessonProgressError } =
      await supabaseAdmin.from("progress").select("*").eq("user_id", user_id);

    if (lessonProgressError) throw lessonProgressError;
    return res.json({
      success: true,
      quiz_attempt_data,
      quizzes_data,
      lesson_completion_data,
      lessonProgress,
    });
  } catch (err) {
    console.error("finalQuizUpdate error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
