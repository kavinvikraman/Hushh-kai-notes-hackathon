import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Loader2, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const NotesInput = () => {
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast({ title: "Unsupported file", description: "Please upload a PDF or PowerPoint file.", variant: "destructive" });
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data:...;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const canGenerate = file || notes.trim().length >= 50;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({ title: "Too short", description: "Please paste at least 50 characters or upload a file.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, any> = { type: "summary" };
      if (file) {
        body.file = await fileToBase64(file);
        body.fileMimeType = file.type;
      }
      if (notes.trim()) body.notes = notes.trim();

      const { data, error } = await supabase.functions.invoke("generate-notes", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      sessionStorage.setItem("kai_notes", notes.trim() || `[Uploaded: ${file?.name}]`);
      sessionStorage.setItem("kai_summary", JSON.stringify(data));
      if (file) {
        // Store file info so quiz can re-use
        sessionStorage.setItem("kai_file", body.file);
        sessionStorage.setItem("kai_fileMime", body.fileMimeType);
      }
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
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Paste Your Notes or Upload a File</h1>
          <p className="text-muted-foreground mb-6">
            Paste study material below <strong>or</strong> upload a PDF / PowerPoint file and we'll generate a smart summary and quiz.
          </p>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 mb-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <p className="font-medium">Click to upload PDF or PowerPoint</p>
                <p className="text-sm">Max 10MB</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or paste your notes</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here... (minimum 50 characters)"
            className="min-h-[200px] text-base resize-none border-border bg-card focus:ring-primary"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {file ? `File: ${file.name}` : `${notes.length} characters`}
            </span>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
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
                  transition={{ duration: 12, ease: "linear" }}
                />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse-soft">
                AI is reading your {file ? "document" : "notes"}…
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default NotesInput;
