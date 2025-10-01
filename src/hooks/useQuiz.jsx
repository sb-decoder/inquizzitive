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
      Generate ${numQuestions} multiple choice questions on ${selectedCategory} for ${selectedDifficulty} difficulty level.
      
      IMPORTANT: The "answer" field must contain the EXACT same text as one of the options.
      
      Respond strictly in JSON format like:
      [
        {
          "question": "Who is the current Prime Minister of India?",
          "options": ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Yogi Adityanath"],
          "answer": "Narendra Modi",
          "explanation": "Narendra Modi has been the Prime Minister of India since 2014."
        }
      ]
      
      Make sure the answer field exactly matches one of the options (including capitalization and spacing).`;
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
