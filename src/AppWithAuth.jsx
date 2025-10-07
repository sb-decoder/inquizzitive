import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { quizService } from "./services/quizService";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import App from "./App";

const AppWithAuth = () => {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleShowDashboard = () => {
    setShowDashboard(true);
  };

  const saveQuizResult = async (quizData) => {
    if (!user) return { error: "User not authenticated" };

    const result = await quizService.saveQuizResult(quizData);
    return result;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <App
        user={user}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
        onShowDashboard={handleShowDashboard}
        saveQuizResult={saveQuizResult}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
    </>
  );
};

export default AppWithAuth;
