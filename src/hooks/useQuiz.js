import { useState, useEffect, useMemo } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import localQuestions from "../questions.json";

export const useQuiz = () => {
  const [status, setStatus] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("");

  // Timer Effect
  useEffect(() => {
    if (timeLeft > 0 && status === "active") {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && status === "active") {
      setStatus("submitted");
    }
  }, [timeLeft, status]);

  const startQuiz = async (category, difficulty, numQuestions) => {
    setLoading(true);
    setStatus("loading");
    setCurrentCategory(category); // Save the category
    setAnswers({});

    try {
      let questions;
      if (localQuestions.Questions[category]) {
        questions = localQuestions.Questions[category].slice(0, numQuestions);
      } else {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate ${numQuestions} MCQs for ${category} at ${difficulty} difficulty for Indian exams. Provide a JSON array with keys: "question", "options" (array of 4), "answer", "explanation".`;
        const result = await model.generateContent(prompt);
        let text = await result.response.text();
        text = text.replace(/```json|```/g, "").trim();
        questions = JSON.parse(text);
      }

      setQuiz(questions);
      setTimeLeft(questions.length * 30);
      setStatus("active");
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Failed to generate quiz. Please try again.");
      setStatus("setup");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIndex, option) => {
    if (status === "active") {
      setAnswers((prev) => ({ ...prev, [qIndex]: option }));
    }
  };

  const handleSubmit = () => setStatus("submitted");

  const resetQuiz = () => {
    setQuiz([]);
    setAnswers({});
    setStatus("setup");
    setTimeLeft(0);
  };

  const score = useMemo(() => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i]?.trim().toLowerCase() === q.answer?.trim().toLowerCase()) {
        correct++;
      }
    });
    return {
      correct,
      total: quiz.length,
      percentage: quiz.length > 0 ? ((correct / quiz.length) * 100).toFixed(1) : 0,
    };
  }, [quiz, answers]);
  
  // **NEW**: Effect to save results to localStorage
  useEffect(() => {
    if (status === 'submitted' && quiz.length > 0) {
      const newResult = {
        category: currentCategory,
        score: score.correct,
        total: score.total,
        percentage: score.percentage,
        date: new Date().toISOString(),
      };
      const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      history.unshift(newResult); // Add new result to the beginning
      localStorage.setItem('quizHistory', JSON.stringify(history));
    }
  }, [status, quiz.length, score, currentCategory]);

  return { status, loading, quiz, answers, timeLeft, score, startQuiz, handleOptionSelect, handleSubmit, resetQuiz };
};