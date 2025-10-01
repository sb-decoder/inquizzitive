import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SECONDS_PER_QUESTION } from "../constants/quiz.jsx";

export function useQuiz() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !submitted && quiz.length > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && quiz.length > 0 && !submitted) handleSubmit();
  }, [timeLeft, submitted, quiz]);

  // Fetch Quiz
  async function fetchQuiz(selectedCategory, selectedDifficulty, numQuestions) {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
      const result = await model.generateContent(prompt);
      let text = await result.response.text();
      text = text.replace(/```json|```/g, "").trim();

      console.log("Raw AI response:", text); // Debug log

      const questions = JSON.parse(text);

      // Validate and clean the data
      const cleanedQuestions = questions.map((q) => ({
        ...q,
        answer: q.answer?.trim(),
        options: q.options?.map((opt) => opt?.trim()),
      }));

      console.log("Cleaned questions:", cleanedQuestions); // Debug log

      setQuiz(cleanedQuestions);
      // Set timer based on number of questions
      setTimeLeft(cleanedQuestions.length * SECONDS_PER_QUESTION);
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Failed to generate quiz. Check console.");
    }
    setLoading(false);
  }

  function handleOptionSelect(qIndex, option) {
    if (!submitted) setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function resetQuiz() {
    setQuiz([]);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(0);
  }

  return {
    loading,
    quiz,
    answers,
    submitted,
    timeLeft,
    fetchQuiz,
    handleOptionSelect,
    handleSubmit,
    resetQuiz
  };
}
