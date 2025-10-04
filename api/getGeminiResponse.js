import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiResponse = async (req, res) => {
  try {
    const { qcount, category, difficulty } = req.query;
    if(!qcount || !category || !difficulty) {
      return res.status(400).json({ error: "Missing required query parameters: qcount, category, difficulty" });
    }
    const numQuestions = parseInt(qcount, 10);
    const selectedCategory = category;
    const selectedDifficulty = difficulty;

    const apiKey = process.env.GEMINI_API_KEY || null;
    if (!apiKey) {
      console.error("GEMINI API key not found in process.env");
      return res.status(500).json({
        error:
          "Missing Gemini API key on server. Please set GEMINI_API_KEY in the server environment.",
      });
    }

    const prompt = `
      Generate ${numQuestions} multiple-choice questions focused on ${selectedCategory}, tailored for Indian government exam preparation (e.g., UPSC, SSC, or similar competitive exams). Ensure questions are exam-oriented: they should cover key topics, historical events, policies, figures, or concepts relevant to the category, with a focus on factual accuracy, analytical depth, and real-world application where appropriate.

      Adhere to the selected difficulty level which is ${selectedDifficulty}:
      - Easy: Basic recall of facts, straightforward questions with obvious distractors.
      - Medium: Require moderate understanding, including connections between concepts, with plausible distractors.
      - Hard: In-depth analysis, nuanced details, or application-based questions, with closely related distractors that test deep knowledge.

      Guidelines for high-quality questions:
      - Make questions clear, concise, and unambiguous—avoid vagueness, overly broad topics, or irrelevant trivia.
      - Ensure relevance: For Current Affairs, use events up to October 2025; for History/Geography/Politics/Indian Defence, focus on India-centric or globally significant topics impacting India.
      - Options: Provide exactly 4 options per question. Distractors must be plausible and based on common misconceptions or related facts.
      - Answer: Must be factually correct and exactly match one option (case-sensitive, including spacing).
      - Explanation: Provide a detailed, educational explanation (2-4 sentences) citing why the answer is correct and why others are not, to aid learning.

      Respond strictly in valid JSON array format (no extra text, code blocks, or markdown). Example:
      [
        {
          "question": "Who is the current Prime Minister of India?",
          "options": ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Yogi Adityanath"],
          "answer": "Narendra Modi",
          "explanation": "Narendra Modi has been the Prime Minister of India since 2014, leading the BJP government. The other options are prominent politicians but not the current PM."
        }
      ]

      Ensure the entire response is parseable as JSON.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).send(text);
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    return res.status(500).json({
      error: "Failed to fetch Gemini response",
      details: error.message,
    });
  }
};

export { getGeminiResponse };
