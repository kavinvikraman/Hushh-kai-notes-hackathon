/**
 * Signup Page
 * User registration form
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Sparkles, CheckCircle2 } from "lucide-react";
import AuthForm, { AuthFormData } from "@/components/AuthForm";
import { signup } from "@/services/authApi";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await signup(data.name || "", data.email, data.password);
      
      if (response.success) {
        // Redirect to notes page after successful signup
        navigate("/notes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Smart AI-powered summaries",
    "Generate quizzes from your notes",
    "Track your learning progress",
    "Join classroom sessions",
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background via-background to-accent/20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            ClassNexus
          </span>
        </Link>
      </motion.header>

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Start your learning journey
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students using AI to study smarter, not harder.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  className="flex items-center gap-3 text-foreground/80"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Card */}
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                >
                  <Brain className="h-8 w-8 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Create Account
                </h1>
                <p className="text-muted-foreground mt-2">
                  Get started with ClassNexus for free
                </p>
              </div>

              {/* Form */}
              <AuthForm
                mode="signup"
                onSubmit={handleSignup}
                isLoading={isLoading}
                error={error}
              />

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Log in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
