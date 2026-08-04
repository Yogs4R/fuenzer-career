import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import EvaluationReport from "./pages/EvaluationReport";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans antialiased">
        <NavBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/interview" element={<InterviewRoom />} />
          <Route path="/report" element={<EvaluationReport />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}