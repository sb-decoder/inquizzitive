// src/components/LoadingScreen.jsx

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1">
             <div className="h-full w-full rounded-full bg-gray-900"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-pulse">🧠</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Generating Your Quiz...
        </h3>
      </div>
    </div>
  );
}