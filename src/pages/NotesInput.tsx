import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NotesInput = () => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (notes.trim().length < 50) {
      toast({ title: "Too short", description: "Please paste at least 50 characters of notes.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-notes", {
        body: { notes: notes.trim(), type: "summary" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Store in sessionStorage for next pages
      sessionStorage.setItem("kai_notes", notes.trim());
      sessionStorage.setItem("kai_summary", JSON.stringify(data));
      navigate("/summary");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate summary", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center gap-2 max-w-4xl mx-auto w-full">
        <Brain className="h-6 w-6 text-primary cursor-pointer" onClick={() => navigate("/")} />
        <span className="font-display text-lg font-bold text-foreground cursor-pointer" onClick={() => navigate("/")}>Kai Notes</span>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pt-8">
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Paste Your Notes</h1>
          <p className="text-muted-foreground mb-6">
            Paste your study material below and we'll generate a smart summary and quiz.
          </p>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here... (minimum 50 characters)"
            className="min-h-[300px] text-base resize-none border-border bg-card focus:ring-primary"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">{notes.length} characters</span>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={loading || notes.trim().length < 50}
              className="gap-2 font-display font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate Summary
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {loading && (
            <motion.div
              className="mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "linear" }}
                />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse-soft">
                AI is reading your notes…
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default NotesInput;
