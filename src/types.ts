export type Priority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Completed' | 'In progress' | 'Blocked' | 'Todo';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
}

export interface Task {
  id: string;
  title: string;              // Project Name
  category?: string;          // Category (e.g. แผนก/ITW, Website, System)
  project: string;            // Project / Category
  priority: Priority;         // Priority (High, Medium, Low)
  status: TaskStatus;         // Status (Todo, In progress, Completed, Blocked)
  owner: string;              // Owner
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAvatar?: string;
  techStack?: string;         // Tech Stack / Tools
  startDate?: string;         // Start Date
  dueDate?: string;           // Due Date
  duration?: string | number; // Duration
  description?: string;       // Description
  resultOutcome?: string;     // Result / Outcome
  projectLink?: string;       // Project Link
  progress?: number;          // Project Progress (0-100)
  progressBar?: string;       // Progress Bar
  subtasks?: Subtask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;                 // ID (Column A)
  name: string;               // Name (Column B)
  phone: string;              // Phone (Column C)
  projectId?: string;         // Project ID (Column D)
  project: string;
  email?: string;
  role?: string;
  avatar?: string;
  tasksCount?: number;
}

export type ActiveTab = 'dashboard' | 'work' | 'employees' | 'sheets_guide' | 'settings';
