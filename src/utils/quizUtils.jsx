export function calculateScore(quiz, answers) {
  let correct = 0;
  quiz.forEach((q, i) => {
    // Trim whitespace and do case-insensitive comparison
    const userAnswer = answers[i]?.trim();
    const correctAnswer = q.answer?.trim();

    if (
      userAnswer &&
      correctAnswer &&
      userAnswer.toLowerCase() === correctAnswer.toLowerCase()
    ) {
      correct++;
    }
  });
  return {
    correct,
    total: quiz.length,
    percentage: ((correct / quiz.length) * 100).toFixed(1),
  };
}

export function calculateProgress(answers, totalQuestions) {
  const answeredCount = Object.keys(answers).length;
  const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  return {
    answered: answeredCount,
    total: totalQuestions,
    percentage: Math.round(percentage)
  };
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
