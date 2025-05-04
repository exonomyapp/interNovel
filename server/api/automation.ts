// filepath: /workspaces/interNovel/server/api/automation.ts
import { H3Event } from 'h3';
import { getIssue } from '../github';
import { db, Issue } from '../db';
import { AutomationStep } from '~/types';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const method = event.method;

  // GET requests for retrieving automation status
  if (method === 'GET') {
    const issueNumber = query.issueNumber ? Number(query.issueNumber) : null;
    
    if (!issueNumber) {
      setResponseStatus(event, 400);
      return { error: 'Issue number is required' };
    }
    
    // Get the issue from the database
    const issue = await db.issues.where('number').equals(issueNumber).first();
    
    if (!issue) {
      setResponseStatus(event, 404);
      return { error: 'Issue not found' };
    }
    
    // Return automation-specific data
    return {
      issueNumber,
      automationStatus: issue.automationStatus || 'pending',
      automationProgress: issue.automationProgress || [],
      automationLogs: issue.automationLogs || [],
      automationPriority: issue.automationPriority || 'medium',
      automationStartTime: issue.automationStartTime,
      automationEndTime: issue.automationEndTime,
      automationEstimatedTime: issue.automationEstimatedTime,
      automationActualTime: issue.automationActualTime
    };
  }
  
  // POST requests for starting automation
  else if (method === 'POST') {
    try {
      const body = await readBody(event);
      const { issueNumber } = body;
      
      // Basic validation
      if (!issueNumber) {
        setResponseStatus(event, 400);
        return { error: 'Issue number is required' };
      }
      
      // Get the issue from the database
      const issue = await db.issues.where('number').equals(issueNumber).first();
      
      if (!issue) {
        setResponseStatus(event, 404);
        return { error: 'Issue not found' };
      }
      
      // Start automation process
      const now = new Date().toISOString();
      const initialStep: AutomationStep = {
        id: '1',
        name: 'Initialize',
        status: 'in-progress',
        progress: 10,
        startTime: now,
        details: 'Starting automation process'
      };
      
      // Update issue with automation data
      const updatedIssue: Issue = {
        ...issue,
        automationStatus: 'in-progress',
        automationProgress: [initialStep],
        automationLogs: ['Automation started at ' + now],
        automationStartTime: now,
        automationEstimatedTime: body.estimatedTime || 30 // default 30 minutes
      };
      
      // Save the updated issue
      await db.issues.update(issue.id, updatedIssue);
      
      return {
        issueNumber,
        automationStatus: updatedIssue.automationStatus,
        message: 'Automation started successfully'
      };
    } catch (error) {
      console.error('Error starting automation:', error);
      setResponseStatus(event, 500);
      return { error: 'Failed to start automation' };
    }
  }
  
  // PUT requests for updating automation status and progress
  else if (method === 'PUT') {
    try {
      const body = await readBody(event);
      const { 
        issueNumber, 
        status, 
        step,
        log
      } = body;
      
      // Basic validation
      if (!issueNumber) {
        setResponseStatus(event, 400);
        return { error: 'Issue number is required' };
      }
      
      // Get the issue from the database
      const issue = await db.issues.where('number').equals(issueNumber).first();
      
      if (!issue) {
        setResponseStatus(event, 404);
        return { error: 'Issue not found' };
      }
      
      // Create updated issue object
      const updatedIssue: Issue = { ...issue };
      
      // Update automation status if provided
      if (status) {
        if (!['pending', 'in-progress', 'completed', 'failed', 'paused'].includes(status)) {
          setResponseStatus(event, 400);
          return { error: 'Invalid automation status' };
        }
        updatedIssue.automationStatus = status;
        
        // If completing or failing, set end time
        if (status === 'completed' || status === 'failed') {
          updatedIssue.automationEndTime = new Date().toISOString();
          
          // Calculate actual time if we have a start time
          if (updatedIssue.automationStartTime) {
            const startTime = new Date(updatedIssue.automationStartTime).getTime();
            const endTime = new Date(updatedIssue.automationEndTime).getTime();
            updatedIssue.automationActualTime = Math.round((endTime - startTime) / 60000); // Convert ms to minutes
          }
        }
      }
      
      // Add a new automation step if provided
      if (step) {
        const progress = updatedIssue.automationProgress || [];
        
        // If updating an existing step
        const existingStepIndex = progress.findIndex(s => s.id === step.id);
        if (existingStepIndex >= 0) {
          progress[existingStepIndex] = {
            ...progress[existingStepIndex],
            ...step,
            // If completing or failing, set end time
            ...(step.status === 'completed' || step.status === 'failed' 
                ? { endTime: new Date().toISOString() } 
                : {})
          };
        } else {
          // Add new step
          progress.push({
            ...step,
            startTime: new Date().toISOString()
          });
        }
        
        updatedIssue.automationProgress = progress;
      }
      
      // Add a new log entry if provided
      if (log) {
        const logs = updatedIssue.automationLogs || [];
        logs.push(`[${new Date().toISOString()}] ${log}`);
        updatedIssue.automationLogs = logs;
      }
      
      // Save the updated issue
      await db.issues.update(issue.id, updatedIssue);
      
      return {
        issueNumber,
        automationStatus: updatedIssue.automationStatus,
        message: 'Automation updated successfully'
      };
    } catch (error) {
      console.error('Error updating automation:', error);
      setResponseStatus(event, 500);
      return { error: 'Failed to update automation' };
    }
  }
  
  // Unsupported method
  setResponseStatus(event, 405);
  return { error: 'Method not allowed' };
});