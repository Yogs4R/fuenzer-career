import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InterviewSessionProvider } from "./lib/InterviewSession";
import { AuthProvider } from "./lib/AuthContext";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import EvaluationReport from "./pages/EvaluationReport";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewSessionProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <NavBar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/interview" element={<InterviewRoom />} />
              <Route path="/report" element={<EvaluationReport />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </InterviewSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}