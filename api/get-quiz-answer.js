// api/get-quiz-answer.js
import { supabase } from "../src/lib/supabase.server.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      if (!id) {
        return res
          .status(400)
          .json({ error: "Missing required query parameter: id" });
      }

      const { data, error } = await supabase
        .from("quiz")
        .select("quiz_data")
        .eq("quiz_id", id)
        .single();

      if (error) {
        return res.status(500).json({
          error: "Failed to fetch quiz data. Please try again.",
          details: error.message,
        });
      }

      if (!data) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      return res.status(200).json([...data.quiz_data]);
    } catch (error) {
      console.error("Error fetching quiz by ID:", error);
      return res.status(500).json({
        error: "Something went wrong while fetching the quiz.",
        details: error.message,
      });
    }
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}
