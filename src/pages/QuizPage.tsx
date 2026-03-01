import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

const QUIZ_TIME = 300; // 5 minutes

const QuizPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const navigate = useNavigate();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem("kai_quiz");
    if (!raw) { navigate("/notes"); return; }
    const data = JSON.parse(raw);
    setQuestions(data.questions);
    setAnswers(new Array(data.questions.length).fill(null));
    startTimeRef.current = Date.now();
  }, [navigate]);

  useEffect(() => {
    if (questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const handleSubmit = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    sessionStorage.setItem("kai_answers", JSON.stringify(answers));
    sessionStorage.setItem("kai_elapsed", String(elapsed));
    navigate("/results");
  }, [answers, navigate]);

  const selectAnswer = (idx: number) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = idx;
      return copy;
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (questions.length === 0) return null;
  const q = questions[current];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Kai Notes</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className={timeLeft < 60 ? "text-destructive font-bold" : ""}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {current + 1} of {questions.length}</span>
              <span>{answers.filter((a) => a !== null).length} answered</span>
            </div>
            <Progress value={((current + 1) / questions.length) * 100} className="h-2" />
          </div>

          {/* Timer progress */}
          <Progress value={(timeLeft / QUIZ_TIME) * 100} className="h-1 mb-8" />

          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{q.topic}</p>
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">{q.question}</h2>

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    answers[current] === i
                      ? "border-primary bg-accent text-accent-foreground ring-2 ring-primary/30"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="font-semibold mr-3 text-muted-foreground">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrent((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="font-display"
            >
              Previous
            </Button>

            {current === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="font-display font-semibold">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={() => setCurrent((p) => p + 1)} className="font-display">
                Next
              </Button>
            )}
          </div>

          {/* Question dots */}
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${
                  i === current
                    ? "bg-primary text-primary-foreground"
                    : answers[i] !== null
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
