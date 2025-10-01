export default function LoadingScreen({ numQuestions, selectedCategory }) {
  return (
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
              Crafting {numQuestions} questions on {selectedCategory}...
            </p>

            <div className="flex gap-2 mt-2">
              <div
                className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="h-2 w-2 rounded-full bg-pink-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
