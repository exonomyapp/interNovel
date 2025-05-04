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
  author: string;
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  parentId?: number;
  body?: string;
  keywords?: string;
  labels?: string[];
  
  // Automation-specific fields
  automationStatus?: 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';
  automationProgress?: AutomationStep[];
  automationLogs?: string[];
  automationPriority?: 'low' | 'medium' | 'high' | 'critical';
  automationStartTime?: string;
  automationEndTime?: string;
  automationEstimatedTime?: number; // in minutes
  automationActualTime?: number; // in minutes
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