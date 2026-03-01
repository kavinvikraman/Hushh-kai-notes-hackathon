import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import NotesInput from "./pages/NotesInput";
import SummaryPage from "./pages/SummaryPage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import ClassroomPage from "./pages/ClassroomPage";
import ClassroomDashboard from "./pages/ClassroomDashboard";
import ClassroomQuizPage from "./pages/ClassroomQuizPage";
import ClassroomResultsPage from "./pages/ClassroomResultsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/notes" element={<NotesInput />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/classroom" element={<ClassroomPage />} />
          <Route path="/classroom/dashboard" element={<ClassroomDashboard />} />
          <Route path="/classroom/quiz" element={<ClassroomQuizPage />} />
          <Route path="/classroom/results" element={<ClassroomResultsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
