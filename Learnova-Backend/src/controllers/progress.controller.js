import { supabaseAdmin } from "../supabase.js";

export async function progressUpdate(req, res) {
  const { userId, lessonId } = req.body;
  try {
    const { error: updateError } = await supabaseAdmin
      .from("lesson_completions")
      .update({ progress: "In Progress" })
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);

    if (updateError) {
      throw updateError;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to Update code",
    });
  }
}
