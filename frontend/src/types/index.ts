export type KanbanStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export const KANBAN_COLUMNS: KanbanStatus[] = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
];

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ResumeSuggestion {
  id: string;
  text: string;
}

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  status: KanbanStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: ResumeSuggestion[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedJobData {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface AIParseResponse {
  parsed: ParsedJobData;
  suggestions: ResumeSuggestion[];
}

export interface ApplicationFormData {
  company: string;
  role: string;
  status: KanbanStatus;
  jdLink: string;
  notes: string;
  dateApplied: string;
  salaryRange: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  resumeSuggestions: ResumeSuggestion[];
}
