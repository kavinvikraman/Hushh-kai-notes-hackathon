/**
 * AuthForm Component
 * Reusable authentication form for login and signup
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthForm = ({ mode, onSubmit, isLoading, error }: AuthFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const validateForm = (): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return false;
    }

    // Signup specific validations
    if (isSignup) {
      if (!formData.name || formData.name.trim().length < 2) {
        setValidationError("Please enter your name (at least 2 characters)");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setValidationError("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Display */}
      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {displayError}
        </motion.div>
      )}

      {/* Name Field (Signup only) */}
      {isSignup && (
        <motion.div
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="name" className="text-foreground/80">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="pl-10"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
        </motion.div>
      )}

      {/* Email Field */}
      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: isSignup ? 0.2 : 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-foreground/80">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
      </motion.div>

      {/* Password Field */}
      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: isSignup ? 0.3 : 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="password" className="text-foreground/80">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10"
            disabled={isLoading}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Confirm Password Field (Signup only) */}
      {isSignup && (
        <motion.div
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="confirmPassword" className="text-foreground/80">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-10 pr-10"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: isSignup ? 0.5 : 0.3 }}
      >
        <Button
          type="submit"
          className="w-full h-11 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSignup ? "Creating Account..." : "Logging in..."}
            </>
          ) : isSignup ? (
            "Create Account"
          ) : (
            "Log In"
          )}
        </Button>
      </motion.div>
    </form>
  );
};

export default AuthForm;
