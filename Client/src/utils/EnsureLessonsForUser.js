import { supabase } from "@/services/supabaseClient";

export const ensureLessonForUser = async (userId) => {
  if (!userId) return;
  const LESSON_CONTRIBUTION = 10;

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, domain");
  if (lessonsError) {
    console.error("Error fetching lessons", lessonsError);
    return;
  }

  const lessonIds = (lessons || []).map((val) => val.id);
  if (lessonIds.length === 0) return;

  const { data: existing, error: existingError } = await supabase
    .from("lesson_completions")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  if (existingError) {
    console.error("Error fetching existing completions", existingError);
    return;
  }

  const existingIds = new Set((existing || []).map((r) => r.lesson_id));

  const toInsert = lessons
    .filter((lesson) => !existingIds.has(lesson.id))
    .map((lesson) => ({
      user_id: userId,
      lesson_id: lesson.id,
      domain: lesson.domain,
      contribution_percentage: LESSON_CONTRIBUTION,
      completed: false,
      progress: "Not Started",
    }));

  if (toInsert.length === 0) return;

  const { error: insertError } = await supabase
    .from("lesson_completions")
    .insert(toInsert);

  if (insertError) {
    console.error("Error inserting missing completions", insertError);
  }
};
