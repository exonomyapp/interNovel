import Dexie, { Table } from 'dexie';
import { Issue as IssueType, AutomationStep } from '../../types'; // Corrected import path

// Define interfaces for our data structures
export interface Issue extends IssueType {
  // We extend the Issue interface from types/index.ts
  // All fields are inherited from the base interface
}

export interface Comment { // Ensure this is exported
  id: number;
  issueId: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  body: string;
  keywords?: string;
}

export interface LogEntry {
  id?: number;
  timestamp: string;
  type: 'info' | 'error' | 'warning' | 'debug';
  message: string;
  details?: any;
  source: string;
}

// Define the Dexie database class
class GitHubIssueDatabase extends Dexie {
  // Declare table properties without the '!' definite assignment assertion
  issues: Table<Issue, number>;
  comments: Table<Comment, number>;
  logs: Table<LogEntry, number>;

  constructor() {
    super('GitHubIssueDatabase');
    this.version(3).stores({
      issues: 'id, number, title, author, state, createdAt, updatedAt, parentId, automationStatus, automationPriority, *keywords, *labels',
      comments: 'id, issueId, author, createdAt, updatedAt, *keywords',
      logs: '++id, timestamp, type, source'
    });
    // Initialize table properties after defining stores
    this.issues = this.table('issues');
    this.comments = this.table('comments');
    this.logs = this.table('logs');
  }
}

// Export a singleton instance of the database
export const db = new GitHubIssueDatabase(); // Ensure this is exported

// --- Basic Data Handling Functions ---

// Add or update multiple issues
export async function upsertIssues(issues: Issue[]) {
  try {
    await db.issues.bulkPut(issues);
    console.log(`Upserted ${issues.length} issues`);
  } catch (error) {
    console.error('Error upserting issues:', error);
    throw error;
  }
}

// Add or update multiple comments
export async function upsertComments(comments: Comment[]) {
  try {
    await db.comments.bulkPut(comments);
    console.log(`Upserted ${comments.length} comments`);
  } catch (error) {
    console.error('Error upserting comments:', error);
    throw error;
  }
}

// Get all issues (consider pagination for large datasets)
export async function getAllIssues(): Promise<Issue[]> { // Ensure this is exported
  try {
    return await db.issues.toArray(); // Add return statement
  } catch (error) {
    console.error("Error getting all issues:", error);
    return []; // Return empty array on error
  }
}

// Get comments for a specific issue
export async function getCommentsForIssue(issueId: number): Promise<Comment[]> { // Ensure this is exported
  try {
    return await db.comments.where('issueId').equals(issueId).toArray(); // Add return statement
  } catch (error) {
    console.error(`Error getting comments for issue ${issueId}:`, error);
    return []; // Return empty array on error
  }
}

// Basic keyword search (example)
export async function searchIssues(query: string): Promise<Issue[]> { // Ensure this is exported
  try {
    const lowerCaseQuery = query.toLowerCase();
    // This is a basic search; more advanced full-text search might require different indexing
    return await db.issues
      // Ensure the filter callback always returns a boolean
      .filter(issue => issue.keywords?.includes(lowerCaseQuery) ?? false)
      .toArray();
  } catch (error) {
    console.error(`Error searching issues with query "${query}":`, error);
    return []; // Return empty array on error
  }
}

// Add logging functions
export async function addLogEntry(entry: Omit<LogEntry, 'id'>) {
  try {
    const id = await db.logs.add(entry);
    return id;
  } catch (error) {
    console.error('Error adding log entry:', error);
    throw error;
  }
}

export async function getLogs(limit = 100, offset = 0): Promise<LogEntry[]> {
  try {
    return await db.logs
      .orderBy('timestamp')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
}

export async function clearOldLogs(daysToKeep = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    await db.logs
      .where('timestamp')
      .below(cutoffDate.toISOString())
      .delete();
  } catch (error) {
    console.error('Error clearing old logs:', error);
  }
}

// Add more functions as needed (e.g., delete, specific gets, advanced search)