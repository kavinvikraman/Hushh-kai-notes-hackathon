/**
 * Login Page
 * User authentication login form
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Sparkles } from "lucide-react";
import AuthForm, { AuthFormData } from "@/components/AuthForm";
import { login } from "@/services/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(data.email, data.password);
      
      if (response.success) {
        // Redirect to notes page after successful login
        navigate("/notes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          className="w-full max-w-md"
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
                Welcome Back
              </h1>
              <p className="text-muted-foreground mt-2">
                Log in to continue to ClassNexus
              </p>
            </div>

            {/* Form */}
            <AuthForm
              mode="login"
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
