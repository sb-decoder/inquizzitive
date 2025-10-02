import { useMutation } from "@tanstack/react-query";
import { QuizQuestion, QuizRequest } from "../app/api/quiz/route";

interface QuizResponse {
  questions: QuizQuestion[];
}

async function generateQuiz(params: QuizRequest): Promise<QuizResponse> {
  const response = await fetch("/api/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate quiz");
  }

  return response.json();
}

export function useGenerateQuiz() {
  return useMutation({
    mutationFn: generateQuiz,
    onError: (error) => {
      console.error("Quiz generation failed:", error);
    },
  });
}

export type { QuizQuestion, QuizRequest };
