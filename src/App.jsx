// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateAccPage from './pages/CreateAccPage';
import EditPage from './pages/EditPage';
import QuizPage from './pages/QuizPage';
import ProtectedRoute from './components/ProtectedRoute';
import AccountSetupPage from './pages/AccountSetupPage';

// You might need to create this placeholder file if it doesn't exist
// so the import doesn't crash
const ExamPrepPage = () => (<div>Exam Prep Page Content</div>);

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/createAcc" element={<CreateAccPage />} />
      <Route path="/edit" element={<EditPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<QuizPage />} />
        <Route path="/account-setup" element={<AccountSetupPage />} />
        <Route path="/exam-prep" element={<ExamPrepPage />} />
      </Route>
    </Routes>
  );
}

export default App;