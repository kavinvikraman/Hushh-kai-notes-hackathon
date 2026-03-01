import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Play, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface Summary {
  title: string;
  bullets: string[];
  keyTopics: string[];
}

const SummaryPage = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const raw = sessionStorage.getItem("kai_summary");
    if (!raw) {
      navigate("/notes");
      return;
    }
    setSummary(JSON.parse(raw));
  }, [navigate]);

  const handleStartQuiz = async () => {
    setQuizLoading(true);
    try {
      const notes = sessionStorage.getItem("kai_notes");
      if (!notes) throw new Error("Notes not found");
      const { data, error } = await supabase.functions.invoke("generate-notes", {
        body: { notes, type: "quiz" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      sessionStorage.setItem("kai_quiz", JSON.stringify(data));
      navigate("/quiz");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate quiz", variant: "destructive" });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(summary.title, 20, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    let y = 40;
    summary.bullets.forEach((b, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${b}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 4;
    });
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Key Topics:", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(summary.keyTopics.join(", "), 20, y);
    doc.save("kai-notes-revision-sheet.pdf");
  };

  if (!summary) return null;

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
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">{summary.title}</h1>
          <p className="text-muted-foreground mb-6">Your smart summary — {summary.bullets.length} key points</p>

          <div className="bg-card border border-border rounded-xl p-6 space-y-3 mb-6">
            {summary.bullets.map((b, i) => (
              <motion.div
                key={i}
                className="flex gap-3 items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground">{b}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm mb-8">
            <span className="text-muted-foreground">Key topics:</span>
            {summary.keyTopics.map((t) => (
              <span key={t} className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleStartQuiz} disabled={quizLoading} className="gap-2 font-display font-semibold">
              {quizLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating Quiz…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start Quiz
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 font-display">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SummaryPage;
