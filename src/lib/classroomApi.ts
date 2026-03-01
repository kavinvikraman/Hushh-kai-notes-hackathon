/**
 * Classroom API Service
 * Handles all classroom-related API calls
 */

// Use relative paths in production (same origin), localhost for development
const API_BASE = import.meta.env.PROD 
  ? '' 
  : 'http://localhost:3001';

export interface Student {
  name: string;
  score: number;
}

export interface Classroom {
  code: string;
  name: string;
  studentCount?: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}

/**
 * Create a new classroom
 */
export async function createClassroom(className: string): Promise<Classroom> {
  const response = await fetch(`${API_BASE}/create-classroom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ className }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create classroom');
  }
  
  return response.json();
}

/**
 * Join an existing classroom
 */
export async function joinClassroom(code: string, studentName: string): Promise<{ success: boolean; classroom: string; message: string }> {
  const response = await fetch(`${API_BASE}/join-classroom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, studentName }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join classroom');
  }
  
  return response.json();
}

/**
 * Submit quiz score
 */
export async function submitQuizScore(code: string, studentName: string, score: number): Promise<{ success: boolean; rank: number; totalStudents: number }> {
  const response = await fetch(`${API_BASE}/submit-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, studentName, score }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit quiz');
  }
  
  return response.json();
}

/**
 * Get leaderboard for a classroom
 */
export async function getLeaderboard(code: string): Promise<{ classroom: string; leaderboard: LeaderboardEntry[] }> {
  const response = await fetch(`${API_BASE}/leaderboard/${code}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch leaderboard');
  }
  
  return response.json();
}

/**
 * Get classroom details
 */
export async function getClassroom(code: string): Promise<Classroom> {
  const response = await fetch(`${API_BASE}/classroom/${code}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Classroom not found');
  }
  
  return response.json();
}
