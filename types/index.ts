export interface TreeNodeData {
  id: number; // Corresponds to Issue ID
  number: number; // Corresponds to Issue Number
  title: string;
  parentId?: number;
  children: TreeNodeData[];
  state?: 'open' | 'closed';
  labels?: string[];
  author?: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  labels?: string[];
  author?: string;
  parentId?: number;
  automationStatus?: string;
  automationProgress?: number;
  keywords?: string[];  // Add keywords array for search functionality
}

export interface Comment {
  id: number;
  issueNumber: number;
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  reactions?: {
    [key: string]: number;
  };
  isEdited?: boolean;
}

export interface AutomationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  progress: number; // 0-100
  startTime?: string;
  endTime?: string;
  details?: string;
}