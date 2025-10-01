import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateAccPage from './pages/createAccPage';
import EditPage from './pages/EditPage';
import QuizPage from './pages/QuizPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/createAcc" element={<CreateAccPage />} />
      <Route path="/edit" element={<EditPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* The main quiz app is now the default, protected route */}
        <Route path="/" element={<QuizPage />} /> 
      </Route>
    </Routes>
  );
}

export default App;