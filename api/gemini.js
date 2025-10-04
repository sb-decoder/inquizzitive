import { getGeminiResponse } from "./getGeminiResponse.js";

export default async function handler(req, res) {
  // Optionally enforce only GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Delegate to your existing function (which expects req, res)
    return await getGeminiResponse(req, res);
  } catch (err) {
    console.error("Error in /api/gemini handler:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}