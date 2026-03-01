import { motion } from "framer-motion";
import { BookOpen, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">Kai Notes</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Study Tool
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Turn your notes into
              <span className="text-primary"> exam-ready</span> material
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Paste your study notes and instantly get smart summaries, quizzes, and
              personalized feedback to ace your exams.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl font-display font-semibold"
              onClick={() => navigate("/notes")}
            >
              Get Started
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              {
                icon: BookOpen,
                title: "Smart Summaries",
                desc: "Get 8–10 key bullet points from your notes instantly.",
              },
              {
                icon: Brain,
                title: "AI Quizzes",
                desc: "10 MCQ questions generated from your content.",
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                desc: "See your score, weak topics, and improvement tips.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
