import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Clock, Sparkles, ChevronLeft, ChevronRight, Send, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { submitQuizScore } from "@/lib/classroomApi";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

const QUIZ_TIME = 600; // 10 minutes

const ClassroomQuizPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const startTimeRef = useRef(Date.now());
  
  const classroomCode = sessionStorage.getItem("kai_classroom_code");
  const studentName = sessionStorage.getItem("kai_student_name");

  useEffect(() => {
    const raw = sessionStorage.getItem("kai_quiz");
    if (!raw || !classroomCode || !studentName) { 
      navigate("/classroom/dashboard"); 
      return; 
    }
    const data = JSON.parse(raw);
    setQuestions(data.questions);
    setAnswers(new Array(data.questions.length).fill(null));
    startTimeRef.current = Date.now();
  }, [navigate, classroomCode, studentName]);

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

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Calculate score
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    try {
      // Submit to classroom backend
      if (classroomCode && studentName) {
        await submitQuizScore(classroomCode, studentName, score);
      }
      
      // Store results locally
      sessionStorage.setItem("kai_answers", JSON.stringify(answers));
      sessionStorage.setItem("kai_elapsed", String(elapsed));
      sessionStorage.setItem("kai_classroom_score", String(score));
      
      navigate("/classroom/results");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      // Still navigate to results even if submission failed
      sessionStorage.setItem("kai_answers", JSON.stringify(answers));
      sessionStorage.setItem("kai_elapsed", String(elapsed));
      navigate("/classroom/results");
    }
  }, [answers, questions, navigate, classroomCode, studentName, submitting, toast]);

  const selectAnswer = (idx: number) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = idx;
      return copy;
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;
  const answeredCount = answers.filter((a) => a !== null).length;

  if (questions.length === 0) return null;
  const q = questions[current];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background via-background to-accent/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.header
        className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto w-full relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">Kai Notes</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 px-3 py-1 rounded-full text-xs font-medium">
            <Users className="h-3 w-3" />
            {classroomCode}
          </div>
        </div>
        <motion.div
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
            isLowTime
              ? "bg-destructive/10 border border-destructive/30 text-destructive"
              : "bg-accent/50 backdrop-blur-sm border border-border/50 text-muted-foreground"
          }`}
          animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: isLowTime ? Infinity : 0, duration: 1 }}
        >
          {isLowTime && <AlertCircle className="h-4 w-4" />}
          <Clock className="h-4 w-4" />
          <span className="font-mono text-sm">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </motion.div>
      </motion.header>

      <main className="flex-1 px-6 pb-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Progress Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">
                Question <strong className="text-foreground">{current + 1}</strong> of {questions.length}
              </span>
              <span className="text-muted-foreground">
                <strong className={answeredCount === questions.length ? "text-green-500" : "text-foreground"}>
                  {answeredCount}
                </strong>{" "}
                answered
              </span>
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-primary to-purple-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg shadow-purple-500/5 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-500 px-3 py-1 rounded-full text-xs font-medium">
                  {q.topic}
                </span>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-8 leading-relaxed">
                {q.question}
              </h2>

              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = answers[current] === i;
                  const optionLetter = String.fromCharCode(65 + i);
                  return (
                    <motion.button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                          : "border-border/50 bg-card/50 hover:border-purple-500/40 hover:bg-accent/30"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`h-10 w-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
                            isSelected
                              ? "bg-purple-500 text-white"
                              : "bg-muted/50 text-muted-foreground group-hover:bg-purple-500/20 group-hover:text-purple-500"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span className={`flex-1 ${isSelected ? "text-foreground font-medium" : "text-foreground/80"}`}>
                          {opt}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrent((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="font-display gap-2 rounded-xl hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {current === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                className="font-display font-semibold gap-2 rounded-xl px-8 bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrent((p) => p + 1)}
                className="font-display gap-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Question Navigator Dots */}
          <motion.div
            className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-muted-foreground mb-3 text-center font-medium">Jump to question</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {questions.map((_, i) => {
                const isCurrentQ = i === current;
                const isAnswered = answers[i] !== null;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-9 w-9 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isCurrentQ
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110"
                        : isAnswered
                        ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                    whileHover={{ scale: isCurrentQ ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ClassroomQuizPage;
