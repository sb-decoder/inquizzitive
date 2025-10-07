import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState } from "react";

export default function App() {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Custom questions for subjects
  // const customQuestions = {
  //   Sports: [
     
  //     {
  //       question: "Which country has won the most Olympic medals overall?",
  //       options: ["USA", "China", "Russia", "Germany"],
  //       answer: "USA",
  //       explanation: "The USA has won the most Olympic medals in history."
  //     },
  //     {
  //       question: "Which football club is known as 'The Red Devils'?",
  //       options: ["Manchester United", "Liverpool", "Arsenal", "Chelsea"],
  //       answer: "Manchester United",
  //       explanation: "Manchester United is nicknamed 'The Red Devils'."
  //     },
  //     {
  //       question: "Which city hosted the first modern Olympic Games?",
  //       options: ["Athens", "Paris", "London", "Rome"],
  //       answer: "Athens",
  //       explanation: "Athens hosted the first modern Olympic Games in 1896."
  //     },
  //     {
  //       question: "Which country won the ICC Cricket World Cup in 2011?",
  //       options: ["India", "Australia", "Sri Lanka", "South Africa"],
  //       answer: "India",
  //       explanation: "India won the ICC Cricket World Cup in 2011."
  //     },
  //     {
  //       question: "Which Indian cricketer is known as the 'God of Cricket'?",
  //       options: ["Sachin Tendulkar", "Virat Kohli", "MS Dhoni", "Kapil Dev"],
  //       answer: "Sachin Tendulkar",
  //       explanation: "Sachin Tendulkar is widely regarded as the 'God of Cricket'."
  //     },
  //     {
  //       question: "Which tennis player has won the most Grand Slam titles?",
  //       options: ["Serena Williams", "Roger Federer", "Rafael Nadal", "Novak Djokovic"],
  //       answer: "Novak Djokovic",
  //       explanation: "Novak Djokovic holds the record for most Grand Slam titles."
  //     },
  //     {
  //       question: "Which country hosted the 2022 FIFA World Cup?",
  //       options: ["Qatar", "Russia", "USA", "Brazil"],
  //       answer: "Qatar",
  //       explanation: "Qatar hosted the FIFA World Cup in 2022."
  //     },
  //     {
  //       question: "Who is known as the fastest man in the world?",
  //       options: ["Usain Bolt", "Tyson Gay", "Yohan Blake", "Justin Gatlin"],
  //       answer: "Usain Bolt",
  //       explanation: "Usain Bolt holds the world record for the 100m sprint."
  //     }
  //   ],
  //   Literature: [
     
  //     {
  //       question: "Who wrote 'War and Peace'?",
  //       options: ["Leo Tolstoy", "Fyodor Dostoevsky", "Anton Chekhov", "Vladimir Nabokov"],
  //       answer: "Leo Tolstoy",
  //       explanation: "'War and Peace' was written by Leo Tolstoy."
  //     },
  //     {
  //       question: "Who is the author of 'The Catcher in the Rye'?",
  //       options: ["J.D. Salinger", "F. Scott Fitzgerald", "Ernest Hemingway", "Mark Twain"],
  //       answer: "J.D. Salinger",
  //       explanation: "J.D. Salinger wrote 'The Catcher in the Rye'."
  //     },
  //     {
  //       question: "Who wrote 'The Odyssey'?",
  //       options: ["Homer", "Virgil", "Sophocles", "Euripides"],
  //       answer: "Homer",
  //       explanation: "'The Odyssey' is an epic poem written by Homer."
  //     },
  //     {
  //       question: "Who is the author of 'Animal Farm'?",
  //       options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "J.K. Rowling"],
  //       answer: "George Orwell",
  //       explanation: "George Orwell wrote 'Animal Farm'."
  //     },
  //     {
  //       question: "Who wrote 'The Great Gatsby'?",
  //       options: ["F. Scott Fitzgerald", "Ernest Hemingway", "Mark Twain", "Harper Lee"],
  //       answer: "F. Scott Fitzgerald",
  //       explanation: "'The Great Gatsby' was written by F. Scott Fitzgerald."
  //     },
  //     {
  //       question: "Who is the author of '1984'?",
  //       options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "J.D. Salinger"],
  //       answer: "George Orwell",
  //       explanation: "George Orwell wrote the dystopian novel '1984'."
  //     },
  //     {
  //       question: "Who wrote 'To Kill a Mockingbird'?",
  //       options: ["Harper Lee", "Mark Twain", "F. Scott Fitzgerald", "Ernest Hemingway"],
  //       answer: "Harper Lee",
  //       explanation: "Harper Lee wrote 'To Kill a Mockingbird'."
  //     },
  //     {
  //       question: "Which book series features the character Harry Potter?",
  //       options: ["Harry Potter", "Percy Jackson", "The Hunger Games", "Twilight"],
  //       answer: "Harry Potter",
  //       explanation: "Harry Potter is the main character in the 'Harry Potter' series by J.K. Rowling."
  //     }
  //   ],
  //   "Current Affairs": [
  //     {
  //       question: "Which country recently joined the European Union in 2025?",
  //       options: ["Albania", "Serbia", "Ukraine", "Moldova"],
  //       answer: "Ukraine",
  //       explanation: "Ukraine joined the European Union in 2025."
  //     },
  //     {
  //       question: "Who is the current UN Secretary-General?",
  //       options: ["António Guterres", "Ban Ki-moon", "Kofi Annan", "Boutros Boutros-Ghali"],
  //       answer: "António Guterres",
  //       explanation: "António Guterres is the current UN Secretary-General."
  //     },
  //     {
  //       question: "Who is the current Prime Minister of Canada?",
  //       options: ["Justin Trudeau", "Stephen Harper", "Jean Chrétien", "Paul Martin"],
  //       answer: "Justin Trudeau",
  //       explanation: "Justin Trudeau is the current Prime Minister of Canada."
  //     },
  //     {
  //       question: "Which country won the FIFA Women's World Cup in 2023?",
  //       options: ["Spain", "USA", "Germany", "Japan"],
  //       answer: "Spain",
  //       explanation: "Spain won the FIFA Women's World Cup in 2023."
  //     },
  //     {
  //       question: "Who is the current President of the United States?",
  //       options: ["Joe Biden", "Donald Trump", "Barack Obama", "Kamala Harris"],
  //       answer: "Joe Biden",
  //       explanation: "Joe Biden is the current President of the United States (as of 2025)."
  //     },
  //     {
  //       question: "Which country hosted the 2024 Summer Olympics?",
  //       options: ["France", "Japan", "USA", "Brazil"],
  //       answer: "France",
  //       explanation: "France hosted the 2024 Summer Olympics in Paris."
  //     },
  //     {
  //       question: "Which country launched the Artemis mission to the Moon?",
  //       options: ["USA", "China", "Russia", "India"],
  //       answer: "USA",
  //       explanation: "The USA launched the Artemis mission to the Moon."
  //     },
  
  //     {
  //       question: "Who won the Nobel Peace Prize in 2024?",
  //       options: ["World Food Programme", "Malala Yousafzai", "Abiy Ahmed", "Maria Ressa"],
  //       answer: "World Food Programme",
  //       explanation: "The World Food Programme won the Nobel Peace Prize in 2024."
  //     },
  //   ],
  //   Geography: [
      
  //     {
  //       question: "Which is the smallest country in the world by area?",
  //       options: ["Vatican City", "Monaco", "Nauru", "San Marino"],
  //       answer: "Vatican City",
  //       explanation: "Vatican City is the smallest country in the world by area."
  //     },
  //     {
  //       question: "Which mountain is the highest in Africa?",
  //       options: ["Kilimanjaro", "Mount Kenya", "Mount Stanley", "Mount Meru"],
  //       answer: "Kilimanjaro",
  //       explanation: "Mount Kilimanjaro is the highest mountain in Africa."
  //     },
  //     {
  //       question: "Which is the largest island in the world?",
  //       options: ["Greenland", "Australia", "Borneo", "Madagascar"],
  //       answer: "Greenland",
  //       explanation: "Greenland is the largest island in the world."
  //     },
  //     {
  //       question: "Which country has the longest coastline?",
  //       options: ["Canada", "Russia", "USA", "Australia"],
  //       answer: "Canada",
  //       explanation: "Canada has the longest coastline in the world."
  //     },
  //     {
  //       question: "What is the largest continent by area?",
  //       options: ["Asia", "Africa", "North America", "Europe"],
  //       answer: "Asia",
  //       explanation: "Asia is the largest continent by area."
  //     },
  //     {
  //       question: "Which river is the longest in the world?",
  //       options: ["Nile", "Amazon", "Yangtze", "Mississippi"],
  //       answer: "Nile",
  //       explanation: "The Nile is considered the longest river in the world."
  //     },
  //     {
  //       question: "Which desert is the largest in the world?",
  //       options: ["Sahara", "Gobi", "Kalahari", "Arabian"],
  //       answer: "Sahara",
  //       explanation: "The Sahara is the largest hot desert in the world."
  //     },
  //     {
  //       question: "Which country has the most natural lakes?",
  //       options: ["Canada", "USA", "Russia", "India"],
  //       answer: "Canada",
  //       explanation: "Canada has the most natural lakes in the world."
  //     }
  //   ],
  //   History: [
      
  //     {
  //       question: "Who was the first President of the United States?",
  //       options: ["George Washington", "John Adams", "Thomas Jefferson", "James Madison"],
  //       answer: "George Washington",
  //       explanation: "George Washington was the first President of the United States."
  //     },
  //     {
  //       question: "Who led the Indian independence movement with nonviolent resistance?",
  //       options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Bhagat Singh"],
  //       answer: "Mahatma Gandhi",
  //       explanation: "Mahatma Gandhi led the Indian independence movement with nonviolent resistance."
  //     },
  //     {
  //       question: "Who was the first woman to win a Nobel Prize?",
  //       options: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Dorothy Hodgkin"],
  //       answer: "Marie Curie",
  //       explanation: "Marie Curie was the first woman to win a Nobel Prize."
  //     },
  //     {
  //       question: "Who was the first man to step on the Moon?",
  //       options: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "Michael Collins"],
  //       answer: "Neil Armstrong",
  //       explanation: "Neil Armstrong was the first man to step on the Moon in 1969."
  //     },
  //     {
  //       question: "Who was the first Emperor of China?",
  //       options: ["Qin Shi Huang", "Kublai Khan", "Sun Yat-sen", "Mao Zedong"],
  //       answer: "Qin Shi Huang",
  //       explanation: "Qin Shi Huang was the first Emperor of China."
  //     },
  //     {
  //       question: "Who wrote the Indian national anthem?",
  //       options: ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Sarojini Naidu", "Subhas Chandra Bose"],
  //       answer: "Rabindranath Tagore",
  //       explanation: "Rabindranath Tagore wrote 'Jana Gana Mana', the Indian national anthem."
  //     }
  //   ],
  //   "Indian Defence": [
      
  //     {
  //       question: "Which Indian submarine is nuclear-powered?",
  //       options: ["INS Arihant", "INS Chakra", "INS Sindhughosh", "INS Shankul"],
  //       answer: "INS Arihant",
  //       explanation: "INS Arihant is India's first nuclear-powered submarine."
  //     },
  //     {
  //       question: "Which Indian missile is an intercontinental ballistic missile?",
  //       options: ["Agni-V", "Prithvi", "Akash", "Nag"],
  //       answer: "Agni-V",
  //       explanation: "Agni-V is an intercontinental ballistic missile developed by India."
  // },
  //     {
  //       question: "Which is the largest warship in the Indian Navy?",
  //       options: ["INS Vikramaditya", "INS Viraat", "INS Shivalik", "INS Kolkata"],
  //       answer: "INS Vikramaditya",
  //       explanation: "INS Vikramaditya is the largest warship in the Indian Navy."
  // },
  //     {
  //       question: "Which Indian missile is surface-to-air?",
  //       options: ["Akash", "Agni", "Prithvi", "Nag"],
  //       answer: "Akash",
  //       explanation: "Akash is a surface-to-air missile developed by India."
  // },
   
  //     {
  //       question: "Which Indian aircraft is known as 'Tejas'?",
  //       options: ["LCA", "Sukhoi", "Mirage", "Jaguar"],
  //       answer: "LCA",
  //       explanation: "LCA Tejas is an Indian light combat aircraft."
  // },
  //     {
  //       question: "Which is the oldest regiment in the Indian Army?",
  //       options: ["Madras Regiment", "Sikh Regiment", "Gorkha Regiment", "Rajput Regiment"],
  //       answer: "Madras Regiment",
  //       explanation: "Madras Regiment is the oldest regiment in the Indian Army."
  // },
  //   ],
  //   Politics: [
      
  //     {
  //       question: "Who is the current Chief Minister of West Bengal?",
  //       options: ["Mamata Banerjee", "Suvendu Adhikari", "Abhishek Banerjee", "Babul Supriyo"],
  //       answer: "Mamata Banerjee",
  //       explanation: "Mamata Banerjee is the Chief Minister of West Bengal."
  //     },
  //     {
  //       question: "Which Indian political party was founded by Arvind Kejriwal?",
  //       options: ["AAP", "BJP", "Congress", "TMC"],
  //       answer: "AAP",
  //       explanation: "Arvind Kejriwal founded the Aam Aadmi Party (AAP)."
  // },
  //     {
  //       question: "Who is the current Vice President of India?",
  //       options: ["Jagdeep Dhankhar", "Venkaiah Naidu", "Hamid Ansari", "Krishna Kant"],
  //       answer: "Jagdeep Dhankhar",
  //       explanation: "Jagdeep Dhankhar is the current Vice President of India (as of 2025)."
  // },
  //     {
  //       question: "Which party is currently in power in Tamil Nadu?",
  //       options: ["DMK", "AIADMK", "BJP", "Congress"],
  //       answer: "DMK",
  //       explanation: "DMK is currently in power in Tamil Nadu."
  // },
   
  //     {
  //       question: "Who is the current Prime Minister of India?",
  //       options: ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Manmohan Singh"],
  //       answer: "Narendra Modi",
  //       explanation: "Narendra Modi is the current Prime Minister of India (as of 2025)."
  // },
  //     {
  //       question: "Which Indian state has the largest number of Lok Sabha seats?",
  //       options: ["Uttar Pradesh", "Maharashtra", "West Bengal", "Tamil Nadu"],
  //       answer: "Uttar Pradesh",
  //       explanation: "Uttar Pradesh has the largest number of Lok Sabha seats."
  // }
  //   ]
  // };

  // REAL Adaptive difficulty state
  const [userPerformance, setUserPerformance] = useState({
    correctStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    currentDifficulty: "Medium",
    questionPool: {
      Easy: [],
      Medium: [],
      Hard: []
    },
    currentQuestionIndex: 0
  });

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [categories] = useState([
    "Current Affairs",
    "Geography",
    "History",
    "Indian Defence",
    "Politics",
    "Sports",
    "Literature",
  ]);
  const [difficulties] = useState(["Easy", "Medium", "Hard"]);
  const [selectedCategory, setSelectedCategory] = useState("Current Affairs");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [showStartScreen, setShowStartScreen] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Generate questions for a specific difficulty
  async function generateQuestions(difficulty, count = 5) {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
      Generate ${count} multiple-choice questions focused on ${selectedCategory} at ${difficulty} difficulty level.

      DIFFICULTY SPECIFICS:
      - Easy: Basic recall of facts, straightforward questions with obvious distractors.
      - Medium: Require moderate understanding, including connections between concepts, with plausible distractors.
      - Hard: In-depth analysis, nuanced details, or application-based questions, with closely related distractors that test deep knowledge.

      Guidelines for high-quality questions:
      - Make questions clear, concise, and unambiguous—avoid vagueness, overly broad topics, or irrelevant trivia.
      - Ensure relevance: For Current Affairs, use events up to October 2025; for History/Geography/Politics/Indian Defence, focus on India-centric or globally significant topics impacting India.
      - Options: Provide exactly 4 options per question. Distractors must be plausible and based on common misconceptions or related facts.
      - Answer: Must be factually correct and exactly match one option (case-sensitive, including spacing).
      - Explanation: Provide a detailed, educational explanation (2-4 sentences) citing why the answer is correct and why others are not, to aid learning.
      - Focus on ${selectedCategory} topics

      Respond strictly in valid JSON array format (no extra text, code blocks, or markdown). Example:
      [
        {
          "question": "Who is the current Prime Minister of India?",
          "options": ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Yogi Adityanath"],
          "answer": "Narendra Modi",
          "explanation": "Narendra Modi has been the Prime Minister of India since 2014, leading the BJP government. The other options are prominent politicians but not the current PM."
        }
      ]`;

      const result = await model.generateContent(prompt);
      let text = await result.response.text();
      text = text.replace(/```json|```/g, "").trim();

      const questions = JSON.parse(text);
      return questions.map(q => ({
        ...q,
        answer: q.answer?.trim(),
        options: q.options?.map(opt => opt?.trim()),
        difficulty: difficulty // Tag each question with its difficulty
      }));
    } catch (err) {
      console.error(`Error generating ${difficulty} questions:`, err);
      return [];
    }
  }

  // Pre-load questions for ALL difficulty levels
  async function preloadQuestionPools() {
    setLoading(true);
    
    try {
      // Generate questions for all difficulty levels in parallel
      const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
        generateQuestions("Easy", 8),
        generateQuestions("Medium", 8), 
        generateQuestions("Hard", 8)
      ]);

      setUserPerformance(prev => ({
        ...prev,
        questionPool: {
          Easy: easyQuestions,
          Medium: mediumQuestions,
          Hard: hardQuestions
        },
        currentDifficulty: selectedDifficulty
      }));

      // Start with medium difficulty questions
      setQuiz(mediumQuestions.slice(0, numQuestions));
      setTimeLeft(numQuestions * 30);
      
    } catch (err) {
      console.error("Error preloading questions:", err);
      alert("Failed to load questions. Please try again.");
    }
    setLoading(false);
  }

  // Get next question based on current performance
  const getNextQuestion = (currentPerformance) => {
    const { questionPool, currentDifficulty, currentQuestionIndex } = currentPerformance;
    
    // If we have questions left in current difficulty pool
    if (currentQuestionIndex < questionPool[currentDifficulty].length - 1) {
      return questionPool[currentDifficulty][currentQuestionIndex];
    }
    
    // If we're out of questions in current difficulty, try to get from other pools
    const availableQuestions = [
      ...questionPool[currentDifficulty],
      ...questionPool.Medium,
      ...questionPool.Easy,
      ...questionPool.Hard
    ].filter(q => !answers[Object.keys(answers).length]); // Not already answered
    
    return availableQuestions[0] || questionPool.Medium[0]; // Fallback
  };

  // REAL adaptive difficulty calculation
  const calculateRealAdaptiveDifficulty = (performance) => {
    const { correctStreak, totalCorrect, totalAnswered, currentDifficulty } = performance;
    
    if (totalAnswered < 2) return currentDifficulty; // Wait for some data
    
    const accuracy = totalCorrect / totalAnswered;
    
    // Adaptive logic:
    if (currentDifficulty === "Easy" && correctStreak >= 3 && accuracy >= 0.7) {
      return "Medium";
    } else if (currentDifficulty === "Medium") {
      if (correctStreak >= 3 && accuracy >= 0.8) {
        return "Hard";
      } else if (accuracy < 0.4) {
        return "Easy";
      }
    } else if (currentDifficulty === "Hard" && accuracy < 0.5) {
      return "Medium";
    }
    
    return currentDifficulty;
  };

  // Handle option selection with REAL adaptation
  function handleOptionSelect(qIndex, option) {
    if (!submitted) {
      const currentQuestion = quiz[qIndex];
      const isCorrect = option?.trim().toLowerCase() === currentQuestion.answer?.trim().toLowerCase();
      
      setAnswers((prev) => ({ ...prev, [qIndex]: option }));
      
      // Update performance and potentially change difficulty
      setUserPerformance(prev => {
        const newTotalAnswered = prev.totalAnswered + 1;
        const newTotalCorrect = prev.totalCorrect + (isCorrect ? 1 : 0);
        const newCorrectStreak = isCorrect ? prev.correctStreak + 1 : 0;
        const newQuestionIndex = prev.currentQuestionIndex + 1;
        
        const newPerformance = {
          ...prev,
          correctStreak: newCorrectStreak,
          totalCorrect: newTotalCorrect,
          totalAnswered: newTotalAnswered,
          currentQuestionIndex: newQuestionIndex
        };
        
        // Check if we should change difficulty
        const newDifficulty = calculateRealAdaptiveDifficulty(newPerformance);
        
        // If difficulty changed, update the quiz with new questions
        if (newDifficulty !== prev.currentDifficulty) {
          setTimeout(() => {
            updateQuizWithNewDifficulty(newDifficulty);
          }, 500); // Small delay for smooth transition
        }
        
        return {
          ...newPerformance,
          currentDifficulty: newDifficulty
        };
      });
    }
  }

  // Update quiz when difficulty changes
  const updateQuizWithNewDifficulty = (newDifficulty) => {
    setUserPerformance(prev => {
      const newQuestions = prev.questionPool[newDifficulty].slice(0, numQuestions);
      
      // Update the displayed quiz
      setQuiz(newQuestions);
      
      // Reset answers for new questions (keep old ones for scoring)
      setAnswers({});
      
      return prev;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch Quiz
  async function fetchQuiz() {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setShowStartScreen(false);

    // Reset performance tracking
    setUserPerformance({
      correctStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      currentDifficulty: selectedDifficulty,
      questionPool: { Easy: [], Medium: [], Hard: [] },
      currentQuestionIndex: 0
    });

    // Pre-load questions for all difficulty levels
    await preloadQuestionPools();
  }

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !submitted && quiz.length > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && quiz.length > 0 && !submitted) handleSubmit();
  }, [timeLeft, submitted, quiz]);

  function handleSubmit() {
    setSubmitted(true);
  }

  function calculateScore() {
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

  function resetQuiz() {
    setQuiz([]);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(0);
    setShowStartScreen(true);
    setUserPerformance({
      correctStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      currentDifficulty: selectedDifficulty,
      questionPool: { Easy: [], Medium: [], Hard: [] },
      currentQuestionIndex: 0
    });
  }

  const score = submitted ? calculateScore() : null;
  
  function calculateProgress() {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz.length;
    const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    return {
      answered: answeredCount,
      total: totalQuestions,
      percentage: Math.round(percentage)
    };
  }

  const progress = calculateProgress();
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  // Get difficulty emoji
  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "😊";
      case "Medium": return "😐";
      case "Hard": return "🔥";
      default: return "🎯";
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.hamburger-btn')) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="app">
      {/* Floating Navbar */}
      <nav className="floating-nav">
        <div className="nav-brand">
          <span className="nav-logo">🧠</span>
          <span className="nav-title">Inquizzitive</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <button className="nav-btn" onClick={resetQuiz}>
            Practice
          </button>
          <button className="nav-btn">Dashboard</button>
          <button className="nav-btn nav-btn-primary">Sign In</button>

          <button
            onClick={toggleDarkMode}
            className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="mobile-nav">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hamburger-btn p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Toggle menu"
          >
            <div className="hamburger-icon">
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <button 
              className="mobile-menu-item" 
              onClick={() => {
                resetQuiz();
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="mobile-menu-icon">🎯</span>
              Practice
            </button>
            <button 
              className="mobile-menu-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-menu-icon">📊</span>
              Dashboard
            </button>
            <button 
              className="mobile-menu-item primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-menu-icon">👤</span>
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="main-container">
        {/* Welcome Screen */}
        {showStartScreen && (
          <div className="welcome-section">
            <div className="glass-card welcome-card">
              <h1 className="welcome-title">
                Welcome to <span className="gradient-text">Inquizzitive</span>
              </h1>

              <p className="welcome-subtitle">
                Master government exams with AI-powered practice sessions
              <br />
                <span className="text-sm opacity-75">
                  🎯 Questions actually get harder/easier based on your performance!
                </span>
              </p>

              <div className="quiz-setup">
                <div className="setup-row">
                  <div className="input-group">
                    <label>Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="glass-select"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="glass-select"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff} value={diff}>
                          {diff}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="glass-select"
                  >
                    <option value={5}>5 Questions (2.5 min)</option>
                    <option value={10}>10 Questions (5 min)</option>
                    <option value={15}>15 Questions (7.5 min)</option>
                    <option value={20}>20 Questions (10 min)</option>
                  </select>
                </div>

                <button
                  onClick={fetchQuiz}
                  disabled={loading}
                  className="start-btn"
                >
                  <span>🚀</span>
                 {loading ? "Loading Questions..." : "Start Quiz"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
              </div>

              <div className="relative flex flex-col items-center gap-6">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1">
                    <div className="h-full w-full rounded-full bg-gray-900"></div>
                  </div>

                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: "1.5s" }}
                  >
                    <div className="h-full w-full rounded-full border-4 border-transparent border-t-purple-400"></div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl animate-pulse">🧠</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Generating Your Quiz
                  </h3>
                  <p className="text-gray-400 animate-pulse">
                   Generating Easy, Medium & Hard questions...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {quiz.length > 0 && !submitted && (
          <div className="quiz-section">
            <div className="glass-card quiz-header-card">
              <div className="quiz-info">
                <h2>{selectedCategory} Quiz</h2>
                 <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="quiz-meta">
                 {getDifficultyEmoji(userPerformance.currentDifficulty)} {userPerformance.currentDifficulty} • {quiz.length} Questions
                </span>
                  {/* REAL Adaptive difficulty indicator */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getDifficultyColor(userPerformance.currentDifficulty)}`}>
                    🔄 Live Adaptive: {userPerformance.currentDifficulty}
                  </span>
                  
                  {/* Performance stats */}
                  <span className="text-sm opacity-75">
                    🔥 Streak: {userPerformance.correctStreak} • ✅ {userPerformance.totalCorrect}/{userPerformance.totalAnswered}
                  </span>
                </div>
                
                {/* NEW: Difficulty progression info */}
                {userPerformance.totalAnswered > 0 && (
                  <div className="mt-2 text-xs opacity-60">
                    {userPerformance.currentDifficulty === "Easy" && "Get 3+ correct in a row to advance to Medium!"}
                    {userPerformance.currentDifficulty === "Medium" && userPerformance.correctStreak >= 2 && "Keep going! 1 more correct for Hard level!"}
                    {userPerformance.currentDifficulty === "Hard" && "You're at the highest level! Maintain >50% accuracy."}
                  </div>
                )}
              </div>
              <div className="timer">
                <span className="timer-icon">⏱️</span>
                <span className="timer-text">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="glass-card progress-card">
              <div className="progress-header">
                <span className="progress-text">
                  Progress: {progress.answered} of {progress.total} questions answered
                {userPerformance.totalAnswered > 0 && (
                    <span className="ml-2">• Accuracy: {Math.round((userPerformance.totalCorrect / userPerformance.totalAnswered) * 100)}%</span>
                  )}
                </span>
                <span className="progress-percentage">{progress.percentage}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>

           <div className="questions-container">
              {quiz.map((q, idx) => (
                <div key={idx} className="glass-card question-card">
                  <div className="question-header">
                    <div className="flex justify-between items-start mb-2">
                      <span className="question-number">Q{idx + 1}</span>
                      {/* Show actual question difficulty */}
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(q.difficulty)} text-white`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="question-text">{q.question}</p>
                  </div>

                  <div className="options-grid">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(idx, opt)}
                        className={`option-btn ${
                          answers[idx] === opt ? "selected" : ""
                        }`}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="option-text">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              <button onClick={handleSubmit} className="submit-btn">
                Submit Quiz
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {submitted && score && (
          <div className="results-section">
            <div className="glass-card results-header">
              <div className="results-celebration">
                <span className="celebration-emoji">🎉</span>
                <h2>Quiz Completed!</h2>
                 <p className="text-white opacity-75 mt-2">
                  Your journey: Started at {selectedDifficulty} • Reached:{" "}
                  <span className={`font-bold ${getDifficultyColor(userPerformance.currentDifficulty).replace('bg-', 'text-')}`}>
                    {userPerformance.currentDifficulty}
                  </span>
                </p>
              </div>

              <div className="score-display">
                <div className="score-circle">
                  <span className="score-percentage">{score.percentage}%</span>
                  <span className="score-fraction">
                    {score.correct}/{score.total}
                  </span>
                </div>
                <div className="score-details">
                  <div className="score-item">
                    <span className="score-label">Correct</span>
                    <span className="score-value correct">{score.correct}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Wrong</span>
                    <span className="score-value wrong">
                      {score.total - score.correct}
                    </span>
                  </div>
                   <div className="score-item">
                    <span className="score-label">Best Streak</span>
                    <span className="score-value total">{userPerformance.correctStreak}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Final Level</span>
                    <span className={`score-value ${getDifficultyColor(userPerformance.currentDifficulty).replace('bg-', 'text-')}`}>
                      {userPerformance.currentDifficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

              <div className="answers-review">
              <h3 className="review-title">📝 Answer Review</h3>
              {quiz.map((q, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.answer;

                return (
                  <div key={idx} className={`glass-card answer-card ${isCorrect ? "correct" : "incorrect"}`}>
                    <div className="answer-header">
                      <div className="flex items-center gap-2">
                        <span className="answer-number">Q{idx + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(q.difficulty)} text-white`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <span className={`answer-status ${isCorrect ? "correct" : "incorrect"}`}>
                        {isCorrect ? "✅" : "❌"}
                      </span>
                    </div>

                    <p className="answer-question">{q.question}</p>

                    <div className="answer-details">
                      <div className="answer-row">
                        <span className="answer-label">Your Answer:</span>
                        <span className={`answer-value ${isCorrect ? "correct" : "incorrect"}`}>
                          {userAnswer || "Not answered"}
                        </span>
                      </div>

                      <div className="answer-row">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-value correct">{q.answer}</span>
                      </div>

                      {q.explanation && (
                        <div className="explanation">
                          <span className="explanation-icon">💡</span>
                          <p className="explanation-text">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="results-actions">
              <button onClick={resetQuiz} className="new-quiz-btn">
                🔄 Start New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
