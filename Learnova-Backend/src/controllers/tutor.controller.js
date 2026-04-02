import aiService from "../services/gemini.service.js";
import { supabaseAdmin } from "../supabase.js";

export async function teachLesson(req, res) {
  try {
    const { message, history } = req.body;

    const result = await aiService.teach({
      message,
      history,
    });

    return res.json({
      success: true,
      reply: result.text,
    });
  } catch (err) {
    console.error("❌ Teach Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to teach lesson",
    });
  }
}

export async function saveMessage(req, res) {
  try {
    const { userId, sender, message } = req.body;

    if (!userId || !sender || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const { error } = await supabaseAdmin.from("chat_history").insert([
      {
        user_id: userId,
        sender,
        message,
        message_type: "CHAT",
      },
    ]);

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Save Chat Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save message",
    });
  }
}

export async function loadHistory(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const { data: messages, error } = await supabaseAdmin
      .from("chat_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("❌ Load History Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load history",
    });
  }
}

export default {
  teachLesson,
  saveMessage,
  loadHistory,
};
