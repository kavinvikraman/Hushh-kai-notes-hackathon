/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

// Your backend URL - use localhost for dev, Render URL for production
const API_BASE = import.meta.env.DEV 
  ? "http://localhost:3001" 
  : "https://hushh-kai-notes-hackathon.onrender.com";

// Response types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface AuthError {
  success: false;
  message: string;
}

// Token management
const TOKEN_KEY = 'classnexus_token';
const USER_KEY = 'classnexus_user';

/**
 * Store authentication data in localStorage
 */
export function setAuthData(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user
 */
export function getUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Clear authentication data (logout)
 */
export function clearAuthData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Register a new user
 * POST /api/auth/signup
 */
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to sign up');
  }

  // Store auth data on successful signup
  if (data.success && data.token) {
    setAuthData(data.token, data.user);
  }

  return data;
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to login');
  }

  // Store auth data on successful login
  if (data.success && data.token) {
    setAuthData(data.token, data.user);
  }

  return data;
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getProfile(): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get profile');
  }

  return data;
}

/**
 * Logout user
 */
export function logout(): void {
  clearAuthData();
  // Redirect to login page
  window.location.href = '/login';
}
