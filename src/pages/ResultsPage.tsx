import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Home, Trophy, AlertTriangle, CheckCircle, XCircle, Sparkles, Clock, Target, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const qRaw = sessionStorage.getItem("classnexus_quiz");
    const aRaw = sessionStorage.getItem("kai_answers");
    const eRaw = sessionStorage.getItem("kai_elapsed");
    if (!qRaw || !aRaw) { navigate("/notes"); return; }
    setQuestions(JSON.parse(qRaw).questions);
    setAnswers(JSON.parse(aRaw));
    setElapsed(Number(eRaw || 0));
  }, [navigate]);

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (questions.length === 0) return null;

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);

  const wrongTopics = [...new Set(
    questions.filter((q, i) => answers[i] !== q.correctIndex).map((q) => q.topic)
  )];

  const getMessage = () => {
    if (pct >= 80) return { text: "Excellent! You're well prepared!", emoji: "🎉", icon: Trophy, color: "text-green-500", bg: "bg-green-500" };
    if (pct >= 50) return { text: "Good job! Revise your weak areas.", emoji: "💪", icon: Target, color: "text-amber-500", bg: "bg-amber-500" };
    return { text: "Keep practicing! Focus on the weak topics below.", emoji: "📚", icon: BookOpen, color: "text-red-500", bg: "bg-red-500" };
  };

  const msg = getMessage();
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const handleRetake = () => {
    sessionStorage.removeItem("kai_answers");
    sessionStorage.removeItem("kai_elapsed");
    navigate("/quiz");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background via-background to-accent/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        {pct >= 80 && (
          <>
            <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <motion.header
        className="px-6 py-5 flex items-center gap-2.5 max-w-4xl mx-auto w-full relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative">
            <Brain className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">ClassNexus</span>
        </div>
      </motion.header>

      <main className="flex-1 px-6 pb-12 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Score Card */}
          <motion.div
            variants={itemVariants}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 text-center mb-8 shadow-xl shadow-primary/5 relative overflow-hidden"
          >
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-48 h-48 rounded-full border-4 ${msg.bg}/20 opacity-50`} />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              className={`relative inline-flex items-center justify-center h-32 w-32 rounded-full bg-gradient-to-br from-${msg.bg}/20 to-${msg.bg}/5 border-4 border-${msg.bg}/30 mb-6`}
              style={{
                background: `linear-gradient(135deg, ${pct >= 80 ? 'rgba(34,197,94,0.2)' : pct >= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}, ${pct >= 80 ? 'rgba(34,197,94,0.05)' : pct >= 50 ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)'})`
              }}
            >
              <div className="text-center">
                <span className="font-display text-4xl font-bold text-foreground">{score}</span>
                <span className="text-muted-foreground text-lg">/{questions.length}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="font-display text-5xl font-bold mb-3">
                <span className={msg.color}>{pct}%</span>
              </h1>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${msg.bg}/10 ${msg.color} font-medium mb-4`}>
                <msg.icon className="h-5 w-5" />
                <span>{msg.text}</span>
                <span className="text-xl">{msg.emoji}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Completed in <strong className="text-foreground">{mins}m {secs}s</strong></span>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">{score}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">{questions.length - score}</p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{pct}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </motion.div>

          {/* Weak Topics */}
          {wrongTopics.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Topics to Revise
              </h2>
              <div className="flex flex-wrap gap-2">
                {wrongTopics.map((t, i) => (
                  <motion.span
                    key={t}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Question Review */}
          <motion.div variants={itemVariants}>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Question Review
            </h2>
            <div className="space-y-3 mb-8">
              {questions.map((q, i) => {
                const correct = answers[i] === q.correctIndex;
                const isExpanded = expandedQuestions.has(i);
                return (
                  <motion.div
                    key={i}
                    className={`bg-card/50 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${
                      correct ? "border-green-500/20" : "border-red-500/20"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 + 0.4 }}
                  >
                    <button
                      onClick={() => toggleQuestion(i)}
                      className="w-full p-5 flex items-start gap-4 text-left hover:bg-accent/30 transition-colors"
                    >
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        correct ? "bg-green-500/20" : "bg-red-500/20"
                      }`}>
                        {correct ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{q.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">{q.topic}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-5 pb-5 border-t border-border/30"
                      >
                        <div className="pt-4 space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctIndex;
                            const isUserAnswer = optIdx === answers[i];
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl text-sm flex items-center gap-3 ${
                                  isCorrect
                                    ? "bg-green-500/10 border border-green-500/30"
                                    : isUserAnswer && !correct
                                    ? "bg-red-500/10 border border-red-500/30"
                                    : "bg-muted/30 border border-transparent"
                                }`}
                              >
                                <span className={`font-semibold ${
                                  isCorrect ? "text-green-500" : isUserAnswer && !correct ? "text-red-500" : "text-muted-foreground"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className={isCorrect ? "text-green-600 dark:text-green-400" : isUserAnswer && !correct ? "text-red-500" : "text-foreground/70"}>
                                  {opt}
                                </span>
                                {isCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                                {isUserAnswer && !correct && <span className="text-xs text-red-500 ml-auto">Your answer</span>}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4 flex-wrap">
            <Button
              onClick={handleRetake}
              size="lg"
              className="gap-2 font-display font-semibold rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" /> Retake Quiz
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2 font-display rounded-xl hover:scale-105 transition-all duration-300"
            >
              <Home className="h-4 w-4" /> Home
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResultsPage;
