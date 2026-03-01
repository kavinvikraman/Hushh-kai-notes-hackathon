import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Home, Trophy, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

const ResultsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const qRaw = sessionStorage.getItem("kai_quiz");
    const aRaw = sessionStorage.getItem("kai_answers");
    const eRaw = sessionStorage.getItem("kai_elapsed");
    if (!qRaw || !aRaw) { navigate("/notes"); return; }
    setQuestions(JSON.parse(qRaw).questions);
    setAnswers(JSON.parse(aRaw));
    setElapsed(Number(eRaw || 0));
  }, [navigate]);

  if (questions.length === 0) return null;

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);

  const wrongTopics = [...new Set(
    questions.filter((q, i) => answers[i] !== q.correctIndex).map((q) => q.topic)
  )];

  const getMessage = () => {
    if (pct >= 80) return { text: "Excellent! You're well prepared! 🎉", icon: Trophy, color: "text-success" };
    if (pct >= 50) return { text: "Good job! Revise your weak areas. 💪", icon: AlertTriangle, color: "text-warning" };
    return { text: "Needs improvement. Focus on the weak topics below. 📚", icon: AlertTriangle, color: "text-destructive" };
  };

  const msg = getMessage();
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const handleRetake = () => {
    sessionStorage.removeItem("kai_answers");
    sessionStorage.removeItem("kai_elapsed");
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center gap-2 max-w-4xl mx-auto w-full">
        <Brain className="h-6 w-6 text-primary cursor-pointer" onClick={() => navigate("/")} />
        <span className="font-display text-lg font-bold text-foreground cursor-pointer" onClick={() => navigate("/")}>Kai Notes</span>
      </header>

      <main className="flex-1 px-6 pb-12">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Score Card */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-accent mb-4"
            >
              <span className="font-display text-3xl font-bold text-primary">{score}/{questions.length}</span>
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">{pct}%</h1>
            <p className={`flex items-center justify-center gap-2 font-medium ${msg.color}`}>
              <msg.icon className="h-5 w-5" />
              {msg.text}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Completed in {mins}m {secs}s
            </p>
          </div>

          {/* Weak Topics */}
          {wrongTopics.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Topics to Revise</h2>
              <div className="flex flex-wrap gap-2">
                {wrongTopics.map((t) => (
                  <span key={t} className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Question Review */}
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Question Review</h2>
          <div className="space-y-4 mb-8">
            {questions.map((q, i) => {
              const correct = answers[i] === q.correctIndex;
              return (
                <div key={i} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {correct ? (
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">{q.question}</p>
                      {!correct && (
                        <p className="text-xs text-muted-foreground">
                          Your answer: <span className="text-destructive">{q.options[answers[i] ?? 0]}</span>
                          {" · "}Correct: <span className="text-success">{q.options[q.correctIndex]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleRetake} className="gap-2 font-display font-semibold">
              <RefreshCw className="h-4 w-4" /> Retake Quiz
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2 font-display">
              <Home className="h-4 w-4" /> Home
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResultsPage;
