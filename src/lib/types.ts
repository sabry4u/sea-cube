export type Location = 'mediterranean' | 'caribbean' | 'pacific';

export type ConfidenceThreshold = 50 | 65 | 80 | 95;

export type ErrorCode = '5.1' | '5.2' | '5.3' | '5.4' | '5.5';

export type ObjectType =
  | 'amphora'
  | 'pottery'
  | 'statue'
  | 'anchor'
  | 'coin'
  | 'ship'
  | 'cargo'
  | 'cannon'
  | 'chest'
  | 'tool'
  | 'aircraft';

export interface ClaudeAnalysisResult {
  safetyViolation: boolean;
  violationType: string | null;
  isUnderwater: boolean;
  underwaterReasoning: string;
  hasManMadeObject: boolean;
  manMadeConfidence: number;
  objectType: string | null;
  objectConfidence: number;
}

export interface ArchaeologyTeam {
  id: number;
  team_name: string;
  location: string;
  object_type: string;
  project_name: string | null;
  description: string | null;
  created_at: string;
}

export interface AnalysisError {
  code: ErrorCode;
  message: string;
}

export interface AnalysisSuccess {
  teamName: string;
  projectName: string;
  objectType: string;
  objectConfidence: number;
  manMadeConfidence: number;
}

export interface AnalysisResponse {
  success: boolean;
  error?: AnalysisError;
  result?: AnalysisSuccess;
}

export interface ReviewRequest {
  name: string;
  email: string;
  location: string;
  objectDetected: string;
  confidence: number;
  timestamp: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
}
