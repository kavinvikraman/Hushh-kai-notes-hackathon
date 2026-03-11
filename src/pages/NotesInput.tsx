import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, Loader2, Upload, FileText, X, Sparkles, FileUp, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// API base URL for generate-notes
const API_BASE = import.meta.env.DEV 
  ? "http://localhost:3001" 
  : "https://hushh-kai-notes-hackathon.onrender.com";

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
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!ACCEPTED_TYPES.includes(dropped.type)) {
      toast({ title: "Unsupported file", description: "Please upload a PDF or PowerPoint file.", variant: "destructive" });
      return;
    }
    if (dropped.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setFile(dropped);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

      const response = await fetch(`${API_BASE}/api/generate-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate summary');

      sessionStorage.setItem("classnexus_notes", notes.trim() || `[Uploaded: ${file?.name}]`);
      sessionStorage.setItem("classnexus_summary", JSON.stringify(data));
      if (file) {
        // Store file info so quiz can re-use
        sessionStorage.setItem("classnexus_file", body.file);
        sessionStorage.setItem("classnexus_fileMime", body.fileMimeType);
      }
      navigate("/summary");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate summary", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
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

      <main className="flex-1 flex items-start justify-center px-6 pt-6 pb-12 relative z-10">
        <motion.div
          className="w-full max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              <PenLine className="h-3.5 w-3.5" />
              Step 1 of 3
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Add Your Study Material
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a document <strong className="text-foreground/80">or</strong> paste your notes — we'll transform them into a smart summary and quiz.
            </p>
          </motion.div>

          {/* File Upload Area */}
          <motion.div variants={itemVariants}>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 mb-6 text-center cursor-pointer transition-all duration-300 group ${
                isDragging 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : file 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    className="flex items-center justify-center gap-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key="file-selected"
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="ml-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key="file-upload"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileUp className="h-8 w-8 text-primary/70 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-sm text-muted-foreground">PDF or PowerPoint • Max 10MB</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-sm text-muted-foreground font-medium px-2">or type your notes</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="relative">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste or type your study notes here... (minimum 50 characters)"
                className="min-h-[220px] text-base resize-none rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 p-5"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">
                {notes.length} / 50 min
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {file ? (
                <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  <FileText className="h-4 w-4" />
                  {file.name.length > 20 ? file.name.slice(0, 20) + "..." : file.name}
                </span>
              ) : notes.length >= 50 ? (
                <span className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-4 w-4" />
                  Ready to generate
                </span>
              ) : (
                <span className="text-muted-foreground/60">
                  Add content to continue
                </span>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
              className="gap-2 font-display font-semibold rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 disabled:shadow-none disabled:hover:scale-100"
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
          </motion.div>

          <AnimatePresence>
            {loading && (
              <motion.div
                className="mt-10 flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="relative w-64">
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 12, ease: "linear" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <p className="animate-pulse">
                    AI is reading your {file ? "document" : "notes"}…
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default NotesInput;
