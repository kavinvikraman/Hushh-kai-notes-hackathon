import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Users, GraduationCap, Copy, Check, ArrowRight, UserPlus, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createClassroom, joinClassroom } from "@/lib/classroomApi";

const ClassroomPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Teacher state
  const [className, setClassName] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Student state
  const [joinCode, setJoinCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [joining, setJoining] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"teacher" | "student">("teacher");

  const handleCreateClassroom = async () => {
    if (!className.trim()) {
      toast({ title: "Error", description: "Please enter a classroom name", variant: "destructive" });
      return;
    }
    
    setCreating(true);
    try {
      const result = await createClassroom(className.trim());
      setCreatedCode(result.code);
      toast({ title: "Success!", description: `Classroom created with code: ${result.code}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Classroom code copied to clipboard" });
    }
  };

  const handleJoinClassroom = async () => {
    if (!joinCode.trim()) {
      toast({ title: "Error", description: "Please enter a classroom code", variant: "destructive" });
      return;
    }
    if (!studentName.trim()) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return;
    }
    
    setJoining(true);
    try {
      const result = await joinClassroom(joinCode.trim(), studentName.trim());
      toast({ title: "Welcome!", description: result.message });
      
      // Store session data
      sessionStorage.setItem("kai_classroom_code", joinCode.trim().toUpperCase());
      sessionStorage.setItem("kai_classroom_name", result.classroom);
      sessionStorage.setItem("kai_student_name", studentName.trim());
      
      // Navigate to classroom dashboard
      navigate("/classroom/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setJoining(false);
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background via-background to-accent/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
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
          className="max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              <Users className="h-4 w-4" />
              Classroom Mode
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Learn Together
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Create or join a classroom to take quizzes together and compete on the leaderboard.
            </p>
          </motion.div>

          {/* Tab Selector */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1.5">
              <button
                onClick={() => setActiveTab("teacher")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === "teacher"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Teacher
              </button>
              <button
                onClick={() => setActiveTab("student")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === "student"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Student
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "teacher" ? (
              <motion.div
                key="teacher"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl shadow-primary/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <School className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">Create Classroom</h2>
                    <p className="text-sm text-muted-foreground">Generate a code for your students</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Classroom Name</label>
                    <Input
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g., CS 101 - Introduction to Programming"
                      className="h-12 rounded-xl bg-background/50 border-border/50"
                    />
                  </div>

                  <Button
                    onClick={handleCreateClassroom}
                    disabled={creating || !className.trim()}
                    size="lg"
                    className="w-full gap-2 font-display font-semibold rounded-xl h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 disabled:hover:scale-100"
                  >
                    {creating ? (
                      <>
                        <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Classroom
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {createdCode && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center"
                    >
                      <p className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium">
                        Classroom Code Generated!
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-mono text-4xl font-bold text-foreground tracking-widest">
                          {createdCode}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyCode}
                          className="rounded-xl hover:scale-105 transition-transform"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Share this code with your students
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 gap-2"
                        onClick={() => {
                          sessionStorage.setItem("kai_classroom_code", createdCode);
                          sessionStorage.setItem("kai_classroom_name", className);
                          sessionStorage.setItem("kai_is_teacher", "true");
                          navigate("/classroom/dashboard");
                        }}
                      >
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="student"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl shadow-primary/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">Join Classroom</h2>
                    <p className="text-sm text-muted-foreground">Enter the code from your teacher</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Classroom Code</label>
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g., AB12CD"
                      maxLength={6}
                      className="h-12 rounded-xl bg-background/50 border-border/50 font-mono text-lg tracking-widest text-center uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Your Name</label>
                    <Input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-12 rounded-xl bg-background/50 border-border/50"
                    />
                  </div>

                  <Button
                    onClick={handleJoinClassroom}
                    disabled={joining || !joinCode.trim() || !studentName.trim()}
                    size="lg"
                    className="w-full gap-2 font-display font-semibold rounded-xl h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 disabled:hover:scale-100"
                  >
                    {joining ? (
                      <>
                        <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Classroom
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default ClassroomPage;
