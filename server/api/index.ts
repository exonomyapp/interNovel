import { H3Event, getQuery, readBody, setResponseStatus } from 'h3';
import { createIssue, getIssue, fetchIssues, updateIssue, enhanceIssueReferences, fetchComments, createComment, updateComment, deleteComment, deleteIssue } from '../github';
import { db, Issue, Comment } from '../db';
import { serverLogger as logger } from '../utils/logger';

// Define error response helper for consistent error responses
const apiError = (event: H3Event, statusCode: number, message: string, error?: any) => {
  logger.error(message, error);
  setResponseStatus(event, statusCode);
  return {
    error: message,
    timestamp: new Date().toISOString(),
    details: error?.message || null,
    path: event.node.req.url
  };
};

// Define a type for automation-specific issue extensions
interface AutomationIssue {
  automationStatus?: 'pending' | 'in-progress' | 'completed' | 'failed';
  automationProgress?: any[];
}

// Helper function to parse issue body for child references
async function processChildReferences(issueNumber: number, body: string) {
  // Look for child references in various formats:
  // - "child of #X" or "children: #X, #Y"
  // - Bulleted lists like "- #X" or "* #X"
  // - Numbered lists like "1. #X"
  // - Task lists like "- [ ] #X" or "- [x] #X"
  
  // Array to store all possible child references
  const referencedIssues: number[] = [];
  
  // Check for explicit "child/children" references
  const childPattern = /child(?:ren)?(?:\s+of|\s*:|is|\s+are)?\s+#(\d+)/gi;
  let match;
  while ((match = childPattern.exec(body)) !== null) {
    const childNumber = parseInt(match[1], 10);
    if (!isNaN(childNumber) && childNumber !== issueNumber) { // Avoid self-references
      referencedIssues.push(childNumber);
    }
  }
  
  // Check for list items with issue references
  // This covers bulleted lists, numbered lists, and task lists
  // Use a more robust pattern that better matches various whitespace and formatting
  const listItemPattern = /(?:^|\n)\s*(?:[-*+]|\d+\.|\[[ x]\])\s+#(\d+)/g;
  while ((match = listItemPattern.exec(body)) !== null) {
    const childNumber = parseInt(match[1], 10);
    if (!isNaN(childNumber) && childNumber !== issueNumber) { // Avoid self-references
      referencedIssues.push(childNumber);
    }
  }
  
  // Look for "### Children:" section and parse all issues listed under it
  const childrenSectionMatch = body.match(/### Children:\s*\n((?:(?:[-*]|\d+\.|\[[ x]\])\s+#\d+\s*\n*)+)/i);
  if (childrenSectionMatch && childrenSectionMatch[1]) {
    const childrenSection = childrenSectionMatch[1];
    const sectionItemPattern = /(?:[-*]|\d+\.|\[[ x]\])\s+#(\d+)/g;
    
    while ((match = sectionItemPattern.exec(childrenSection)) !== null) {
      const childNumber = parseInt(match[1], 10);
      if (!isNaN(childNumber) && childNumber !== issueNumber) { // Avoid self-references
        referencedIssues.push(childNumber);
      }
    }
  }
  
  logger.info(`Found child references for #${issueNumber}:`, referencedIssues);
  
  // Update each referenced child issue to set this issue as its parent
  for (const childNumber of referencedIssues) {
    try {
      const childIssue = await getIssue(childNumber);
      if (childIssue) {
        // Update even if parentId is already set, in case it needs to change
        await updateIssue(childNumber, {
          parentId: issueNumber
        });
        logger.info(`Updated Issue #${childNumber} to set parent #${issueNumber}`);
      }
    } catch (error) {
      logger.error(`Failed to update child issue #${childNumber}:`, error);
    }
  }
  
  return referencedIssues;
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const method = event.method;

  // GET requests for retrieving issues and comments
  if (method === 'GET') {
    const type = query.type as string;
    
    // Handle different query types
    if (type === 'issues') {
      // If issueNumber is provided, get a specific issue
      const issueNumber = query.issueNumber ? Number(query.issueNumber) : null;
      
      if (issueNumber) {
        try {
          const issue = await getIssue(issueNumber);
          if (!issue) {
            return apiError(event, 404, 'Issue not found');
          }
          logger.info(`Retrieved issue #${issueNumber}`);
          return issue;
        } catch (error) {
          return apiError(event, 500, `Error retrieving issue #${issueNumber}`, error);
        }
      } 
      // Otherwise, return all issues
      else {
        try {
          const issues = await fetchIssues();
          logger.info(`Retrieved ${issues.length} issues`);
          return issues;
        } catch (error) {
          return apiError(event, 500, 'Error retrieving issues', error);
        }
      }
    } else if (type === 'comments') {
      // Retrieve comments for an issue
      const issueNumber = query.issueNumber ? Number(query.issueNumber) : null;
      
      if (!issueNumber) {
        return apiError(event, 400, 'Issue number is required for fetching comments');
      }
      
      try {
        const comments = await fetchComments(issueNumber);
        logger.info(`Retrieved ${comments.length} comments for issue #${issueNumber}`);
        return comments;
      } catch (error) {
        return apiError(event, 500, `Error retrieving comments for issue #${issueNumber}`, error);
      }
    }
    
    // Invalid query type
    return apiError(event, 400, `Invalid query type: ${type}`);
  }
  
  // POST requests for creating issues and comments
  else if (method === 'POST') {
    try {
      const body = await readBody(event);
      const { type } = body;
      
      // Handle issue creation
      if (!type || type === 'issue') {
        const { title, body: issueBody, parentId, labels } = body;
        
        // Basic validation
        if (!title) {
          return apiError(event, 400, 'Title is required');
        }
        
        // Create the issue with GitHub API
        const newIssue = await createIssue({
          title,
          body: issueBody || '',
          parentId,
          labels
        });
        
        // Create a response object with automation properties
        const responseIssue = {
          ...newIssue,
        } as (typeof newIssue & AutomationIssue);
        
        // If it's an automation issue, set initial status
        if (labels && (labels.includes('automation') || labels.includes('ai-task'))) {
          // Set automation status on the response object
          responseIssue.automationStatus = 'pending';
        }
        
        // Process the issue body for child references (asynchronously)
        if (issueBody) {
          // Don't await this to avoid slowing down the response
          processChildReferences(responseIssue.number, issueBody)
            .catch(err => logger.error("Error processing child references:", err));
        }
        
        logger.info(`Created new issue #${responseIssue.number}: ${title}`);
        return responseIssue;
      }
      // Handle comment creation
      else if (type === 'comment') {
        const { issueNumber, content } = body;
        
        // Validate request
        if (!issueNumber) {
          return apiError(event, 400, 'Issue number is required for creating a comment');
        }
        
        if (!content || content.trim() === '') {
          return apiError(event, 400, 'Comment content cannot be empty');
        }
        
        try {
          const comment = await createComment(issueNumber, content);
          logger.info(`Created new comment on issue #${issueNumber}`);
          return comment;
        } catch (error) {
          return apiError(event, 500, `Error creating comment for issue #${issueNumber}`, error);
        }
      }
      // Handle automation actions
      else if (type === 'automation') {
        const { action, issueNumber } = body;
        if (!action || !issueNumber) {
          return apiError(event, 400, 'Action and issue number are required for automation');
        }
        try {
          let updates: any = {};
          const timestamp = new Date().toISOString();
          if (action === 'trigger') {
            updates.automationStatus = 'in-progress';
            updates.automationStartTime = timestamp;
          } else if (action === 'stop') {
            updates.automationStatus = 'completed';
            updates.automationEndTime = timestamp;
          } else {
            return apiError(event, 400, `Invalid automation action: ${action}`);
          }
          // Update the issue with automation fields
          await updateIssue(issueNumber, updates);
          const updatedIssue = await getIssue(issueNumber);
          logger.info(`Automation ${action} for issue #${issueNumber}`, updates);
          return updatedIssue;
        } catch (error) {
          return apiError(event, 500, `Error processing automation ${action}`, error);
        }
      }
      
      return apiError(event, 400, `Invalid type: ${type}`);
    } catch (error: any) {
      logger.error('API Error:', error);
      return apiError(event, 500, 'Failed to process request', error);
    }
  }
  
  // PUT requests for updating issues and comments
  else if (method === 'PUT') {
    try {
      const body = await readBody(event);
      
      // Handle comment updates
      if (body.type === 'comment') {
        const { commentId, content } = body;
        
        if (!commentId) {
          return apiError(event, 400, 'Comment ID is required');
        }
        
        if (!content || content.trim() === '') {
          return apiError(event, 400, 'Comment content cannot be empty');
        }
        
        try {
          const updatedComment = await updateComment(commentId, content);
          logger.info(`Updated comment #${commentId}`);
          return updatedComment;
        } catch (error) {
          return apiError(event, 500, `Error updating comment #${commentId}`, error);
        }
      }
      
      // Handle issue updates
      else {
        const { number, body: issueBody, automationStatus, automationProgress } = body;
        
        if (!number) {
          return apiError(event, 400, 'Issue number is required');
        }
        
        // Get the current issue
        const issue = await getIssue(number);
        if (!issue) {
          return apiError(event, 404, 'Issue not found');
        }
        
        // Create an updates object to track what we're updating
        const updates: {
          body?: string;
          automationStatus?: string;
          automationProgress?: any[];
        } = {};
        
        // Add the body to updates if provided
        if (issueBody !== undefined) {
          // Enhance any bare issue references with title links
          const enhancedBody = await enhanceIssueReferences(issueBody);
          updates.body = enhancedBody;
        }
        
        // Update automation status if provided
        if (automationStatus) {
          // Validate status value
          const validStatuses = ['pending', 'in-progress', 'completed', 'failed'];
          if (!validStatuses.includes(automationStatus)) {
            return apiError(event, 400, 'Invalid automation status');
          }
          
          updates.automationStatus = automationStatus;
        }
        
        // Update automation progress if provided
        if (automationProgress && Array.isArray(automationProgress)) {
          updates.automationProgress = automationProgress;
        }
        
        // Actually update the issue in GitHub if we have body updates
        if (updates.body !== undefined) {
          await updateIssue(number, { body: updates.body });
        }
        
        // Create a response object with automation properties
        const responseIssue = {
          ...issue,
          body: updates.body !== undefined ? updates.body : issue.body,
        } as (typeof issue & AutomationIssue);
        
        // Set automation properties in the response
        if (updates.automationStatus) {
          responseIssue.automationStatus = updates.automationStatus as 'pending' | 'in-progress' | 'completed' | 'failed';
        }
        
        if (updates.automationProgress) {
          responseIssue.automationProgress = updates.automationProgress;
        }
        
        // If the body was updated, process for child references
        if (updates.body && updates.body !== issue.body) {
          try {
            // Wait for child references to be processed
            const referencedChildren = await processChildReferences(number, updates.body);
            if (referencedChildren.length > 0) {
              logger.info(`Processed child references for #${number}:`, referencedChildren);
              
              // Update the response with any child issues that were found
              // This ensures the response includes the latest relationships
              const updatedIssue = await getIssue(number);
              if (updatedIssue) {
                Object.assign(responseIssue, updatedIssue);
              }
            }
          } catch (err) {
            logger.error("Error processing child references:", err);
          }
        }
        
        return responseIssue;
      }
    } catch (error: any) {
      logger.error('API Error:', error);
      return apiError(event, 500, 'Failed to update', error);
    }
  }
  
  // DELETE requests for issues and comments
  else if (method === 'DELETE') {
    try {
      const body = await readBody(event);
      const { type, commentId, number } = body;
      
      // Handle comment deletion
      if (type === 'comment') {
        if (!commentId) {
          return apiError(event, 400, 'Comment ID is required');
        }
        
        try {
          await deleteComment(commentId);
          logger.info(`Deleted comment #${commentId}`);
          return { success: true, message: `Comment #${commentId} deleted successfully` };
        } catch (error) {
          return apiError(event, 500, `Error deleting comment #${commentId}`, error);
        }
      }
      
      // Handle issue deletion
      else {
        if (!number) {
          return apiError(event, 400, 'Issue number is required');
        }
        
        try {
          await deleteIssue(number);
          logger.info(`Deleted issue #${number}`);
          return { success: true, message: `Issue #${number} deleted successfully` };
        } catch (error) {
          return apiError(event, 500, `Error deleting issue #${number}`, error);
        }
      }
    } catch (error: any) {
      logger.error('API Error:', error);
      return apiError(event, 500, 'Failed to delete', error);
    }
  }
  
  // Unsupported method
  return apiError(event, 405, 'Method not allowed');
});