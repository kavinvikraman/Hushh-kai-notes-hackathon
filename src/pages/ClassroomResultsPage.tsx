import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Trophy, CheckCircle, XCircle, Sparkles, Clock, Target, Users, Crown, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLeaderboard, LeaderboardEntry } from "@/lib/classroomApi";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

const ClassroomResultsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const classroomCode = sessionStorage.getItem("kai_classroom_code");
  const classroomName = sessionStorage.getItem("kai_classroom_name");
  const studentName = sessionStorage.getItem("kai_student_name");

  useEffect(() => {
    const qRaw = sessionStorage.getItem("classnexus_quiz");
    const aRaw = sessionStorage.getItem("kai_answers");
    const eRaw = sessionStorage.getItem("kai_elapsed");
    
    if (!qRaw || !aRaw || !classroomCode) {
      navigate("/classroom");
      return;
    }
    
    setQuestions(JSON.parse(qRaw).questions);
    setAnswers(JSON.parse(aRaw));
    setElapsed(Number(eRaw || 0));
    
    fetchLeaderboard();
  }, [navigate, classroomCode]);

  const fetchLeaderboard = async () => {
    if (!classroomCode) return;
    try {
      const result = await getLeaderboard(classroomCode);
      setLeaderboard(result.leaderboard);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0 || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-accent/10">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  // Find current user's rank
  const userRank = leaderboard.findIndex(e => e.name.toLowerCase() === studentName?.toLowerCase()) + 1;

  const getMessage = () => {
    if (pct >= 80) return { text: "Excellent!", emoji: "🎉", color: "text-green-500", bg: "bg-green-500" };
    if (pct >= 50) return { text: "Good job!", emoji: "💪", color: "text-amber-500", bg: "bg-amber-500" };
    return { text: "Keep practicing!", emoji: "📚", color: "text-red-500", bg: "bg-red-500" };
  };

  const msg = getMessage();

  const handleRetake = () => {
    sessionStorage.removeItem("kai_answers");
    sessionStorage.removeItem("kai_elapsed");
    sessionStorage.removeItem("kai_classroom_score");
    navigate("/classroom/quiz");
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background via-background to-accent/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        {pct >= 80 && (
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
        )}
      </div>

      <motion.header
        className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto w-full relative z-10"
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
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 px-3 py-1.5 rounded-full text-sm font-medium">
          <Users className="h-4 w-4" />
          {classroomCode}
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
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 text-center mb-8 shadow-xl shadow-purple-500/5"
          >
            <div className="mb-2 text-sm text-muted-foreground">{classroomName}</div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              className="relative inline-flex items-center justify-center h-32 w-32 rounded-full mb-6"
              style={{
                background: `linear-gradient(135deg, ${pct >= 80 ? 'rgba(34,197,94,0.2)' : pct >= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}, ${pct >= 80 ? 'rgba(34,197,94,0.05)' : pct >= 50 ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)'})`
              }}
            >
              <div className="text-center">
                <span className="font-display text-4xl font-bold text-foreground">{score}</span>
                <span className="text-muted-foreground text-lg">/{questions.length}</span>
              </div>
            </motion.div>

            <h1 className="font-display text-5xl font-bold mb-3">
              <span className={msg.color}>{pct}%</span>
            </h1>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${msg.bg}/10 ${msg.color} font-medium mb-4`}>
              <span>{msg.text}</span>
              <span className="text-xl">{msg.emoji}</span>
            </div>

            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{mins}m {secs}s</span>
              </div>
              {userRank > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>Rank #{userRank}</span>
                </div>
              )}
            </div>
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
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
              <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-500">{pct}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="font-display text-xl font-semibold text-foreground">Class Leaderboard</h2>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden mb-8">
              {leaderboard.slice(0, 10).map((entry, index) => {
                const isCurrentUser = entry.name.toLowerCase() === studentName?.toLowerCase();
                const rank = index + 1;
                
                return (
                  <motion.div
                    key={entry.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 border-b border-border/30 last:border-b-0 transition-all ${
                      isCurrentUser ? "bg-purple-500/10" : "hover:bg-accent/30"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                      rank <= 3 
                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20"
                        : "bg-muted/50"
                    }`}>
                      {getRankIcon(rank) || <span className="text-muted-foreground">{rank}</span>}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isCurrentUser ? "text-purple-500" : "text-foreground"}`}>
                        {entry.name}
                        {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">{entry.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex gap-4 flex-wrap justify-center">
            <Button
              onClick={handleRetake}
              size="lg"
              className="gap-2 font-display font-semibold rounded-xl px-8 bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" /> Retake Quiz
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/classroom/dashboard")}
              className="gap-2 font-display rounded-xl hover:scale-105 transition-all duration-300"
            >
              <Users className="h-4 w-4" /> Back to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ClassroomResultsPage;
