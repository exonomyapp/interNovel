import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Ensure this token is set in your environment
});

const OWNER = 'exonomyapp';
const REPO = 'interNovel';

// Helper function to update the body of an existing issue
export async function updateIssueBody(issueNumber: number, newBody: string) {
  try {
    await octokit.issues.update({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      body: newBody,
    });
    console.log(`Updated body for issue #${issueNumber}`);
  } catch (error) {
    console.error(`Error updating body for issue #${issueNumber}:`, error);
    // Decide if this should throw or just log
    throw new Error(`Failed to update body for issue #${issueNumber}`);
  }
}

// Function to get a single issue's details (needed to get parent body)
export async function getIssue(issueNumber: number) {
  try {
    const response = await octokit.issues.get({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching issue #${issueNumber}:`, error);
    throw new Error(`Failed to fetch issue #${issueNumber}`);
  }
}

export async function fetchIssues() {
  try {
    const response = await octokit.issues.listForRepo({
      owner: OWNER, // Replace with the repository owner
      repo: REPO, // Replace with the repository name
      state: 'all', // Add this line to fetch both open and closed issues
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw new Error('Failed to fetch issues');
  }
}

export async function fetchComments(issueNumber: number) {
  try {
    const response = await octokit.issues.listComments({
      owner: OWNER, // Replace with the repository owner
      repo: REPO, // Replace with the repository name
      issue_number: issueNumber,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

// Modified function to create a new issue and handle parent relationship
export async function createIssue(options: { 
  title: string; 
  body?: string; 
  parentId?: number;
  labels?: string[];
}) {
  const { title, body, parentId, labels } = options;
  let finalBody = body || '';

  // Add Parent reference to the child's body
  if (parentId) {
    const parentRef = `### Parent:\n#${parentId}`;
    finalBody = `${parentRef}\n\n${finalBody}`; // Prepend parent reference
  }

  try {
    // Create the new (child) issue first
    const response = await octokit.issues.create({
      owner: OWNER,
      repo: REPO,
      title: title,
      body: finalBody, // Use the body with the parent reference
      labels: labels,
    });
    const newIssue = response.data;
    console.log(`Created issue #${newIssue.number}`);

    // If a parentId was provided, update the parent issue's body
    if (parentId) {
      try {
        const parentIssue = await getIssue(parentId);
        const parentBody = parentIssue.body || '';
        const childRef = `- [ ] #${newIssue.number}`; // Task list item for the new child

        let updatedParentBody;
        const childrenSectionRegex = /### Children:/;
        const childrenHeader = '### Children:';

        if (childrenSectionRegex.test(parentBody)) {
          // Append to existing Children section
          updatedParentBody = parentBody.replace(
            childrenSectionRegex,
            `${childrenHeader}\n${childRef}` // Add new child at the beginning of the list
          );
        } else {
          // Add new Children section
          updatedParentBody = `${parentBody}\n\n${childrenHeader}\n${childRef}`;
        }

        await updateIssueBody(parentId, updatedParentBody);

      } catch (parentUpdateError) {
        // Log the error but don't fail the whole creation process
        // The child issue is already created.
        console.error(`Failed to update parent issue #${parentId} body:`, parentUpdateError);
      }
    }

    return newIssue; // Return the newly created issue data
  } catch (error) {
    console.error('Error creating issue:', error);
    throw new Error('Failed to create issue');
  }
}

// General function to update an issue with multiple properties
export async function updateIssue(issueNumber: number, updates: {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  labels?: string[];
  parentId?: number;
}) {
  try {
    // First, get the current issue to preserve values not being updated
    const currentIssue = await getIssue(issueNumber);
    const currentBody = currentIssue.body || '';
    
    // If parentId is being updated, add or update the parent reference in the body
    let updatedBody = updates.body !== undefined ? updates.body : currentBody;
    
    if (updates.parentId !== undefined) {
      const parentRef = `### Parent:\n#${updates.parentId}`;
      const parentSectionRegex = /### Parent:\s*\n#\d+/;
      
      if (parentSectionRegex.test(updatedBody)) {
        // Replace existing parent reference
        updatedBody = updatedBody.replace(parentSectionRegex, parentRef);
      } else {
        // Add new parent reference
        updatedBody = `${parentRef}\n\n${updatedBody}`;
      }
    }
    
    // Prepare the update object for Octokit
    const updateParams: any = {
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
    };
    
    // Only include properties that are being updated
    if (updates.title) updateParams.title = updates.title;
    if (updatedBody !== currentBody) updateParams.body = updatedBody;
    if (updates.state) updateParams.state = updates.state;
    if (updates.labels) updateParams.labels = updates.labels;
    
    // Check if there's anything to update
    if (Object.keys(updateParams).length <= 3) { // owner, repo, issue_number are always present
      console.log(`No changes to update for issue #${issueNumber}`);
      return currentIssue;
    }
    
    // Update the issue
    const response = await octokit.issues.update(updateParams);
    console.log(`Updated issue #${issueNumber}`);
    
    // If parent was updated and it's a new parent, update the parent's body to include this child
    if (updates.parentId) {
      // Check if there's an existing parent reference in the body
      const existingParentMatch = currentBody.match(/### Parent:\s*\n#(\d+)/);
      const existingParentId = existingParentMatch ? parseInt(existingParentMatch[1], 10) : undefined;
      
      // Only proceed if this is a new parent or different from existing parent
      if (existingParentId !== updates.parentId) {
        try {
          const parentIssue = await getIssue(updates.parentId);
          const parentBody = parentIssue.body || '';
          const childRef = `- [ ] #${issueNumber}`; // Task list item for this child
          
          let updatedParentBody;
          const childrenSectionRegex = /### Children:/;
          const childrenHeader = '### Children:';
          
          if (childrenSectionRegex.test(parentBody)) {
            // Append to existing Children section
            updatedParentBody = parentBody.replace(
              childrenSectionRegex,
              `${childrenHeader}\n${childRef}` // Add new child at the beginning of the list
            );
          } else {
            // Add new Children section
            updatedParentBody = `${parentBody}\n\n${childrenHeader}\n${childRef}`;
          }
          
          await updateIssueBody(updates.parentId, updatedParentBody);
        } catch (parentUpdateError) {
          console.error(`Failed to update new parent issue #${updates.parentId} body:`, parentUpdateError);
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating issue #${issueNumber}:`, error);
    throw new Error(`Failed to update issue #${issueNumber}`);
  }
}

// Helper function to enhance issue references in a task list with title links
export async function enhanceIssueReferences(body: string): Promise<string> {
  if (!body) return body;
  
  // Regex to find task list items with bare issue references
  // Matches patterns like "- [ ] #3" but not those already enhanced with titles/links
  const taskListItemPattern = /^(\s*-\s*\[[ x]\]\s+#(\d+))(?!\s+\[.+\]\(.+\))(?!\s+.+)/gm;
  
  // Find all matches
  const matches: { fullMatch: string; issueNumber: number; position: number }[] = [];
  let match;
  
  const bodyToSearch = body;
  while ((match = taskListItemPattern.exec(bodyToSearch)) !== null) {
    const fullMatch = match[1]; // The entire match
    const issueNumber = parseInt(match[2], 10); // Just the issue number
    matches.push({ 
      fullMatch, 
      issueNumber,
      position: match.index
    });
  }
  
  // If no matches, return the original body
  if (matches.length === 0) return body;
  
  console.log(`Found ${matches.length} issue references to enhance with titles:`, 
    matches.map(m => m.issueNumber));
  
  // Create a new body with enhancements, handling matches in reverse order
  // to preserve positions when making replacements
  let enhancedBody = body;
  
  // Process each match and enhance it with the issue title and link
  for (const { fullMatch, issueNumber } of matches.reverse()) {
    try {
      // Fetch the issue to get its title
      const issue = await getIssue(issueNumber);
      if (!issue) continue;
      
      // Create an enhanced version with title link
      const titleLink = `[${issue.title}](https://github.com/${OWNER}/${REPO}/issues/${issueNumber})`;
      const enhanced = `${fullMatch} ${titleLink}`;
      
      // Replace in the body
      enhancedBody = enhancedBody.replace(fullMatch, enhanced);
      console.log(`Enhanced issue #${issueNumber} reference with title: ${issue.title}`);
    } catch (error) {
      // If error fetching issue, just leave it as is
      console.error(`Error enhancing issue #${issueNumber} reference:`, error);
    }
  }
  
  return enhancedBody;
}

// Function to create a comment on an issue
export async function createComment(issueNumber: number, body: string) {
  try {
    const response = await octokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      body: body
    });
    
    console.log(`Created comment on issue #${issueNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating comment on issue #${issueNumber}:`, error);
    throw new Error(`Failed to create comment on issue #${issueNumber}`);
  }
}

// Function to update a comment's content
export async function updateComment(commentId: number, body: string) {
  try {
    const response = await octokit.issues.updateComment({
      owner: OWNER,
      repo: REPO,
      comment_id: commentId,
      body: body
    });
    
    console.log(`Updated comment #${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment #${commentId}:`, error);
    throw new Error(`Failed to update comment #${commentId}`);
  }
}

// Function to delete a comment
export async function deleteComment(commentId: number) {
  try {
    await octokit.issues.deleteComment({
      owner: OWNER,
      repo: REPO,
      comment_id: commentId
    });
    
    console.log(`Deleted comment #${commentId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting comment #${commentId}:`, error);
    throw new Error(`Failed to delete comment #${commentId}`);
  }
}

// Function to delete an issue
export async function deleteIssue(issueNumber: number) {
  try {
    // Note: GitHub API does not allow true deletion of issues
    // The best we can do is to close the issue and update its title to indicate deletion
    const issue = await getIssue(issueNumber);
    
    // Update the issue to mark it as deleted
    await octokit.issues.update({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      state: 'closed',
      title: `[DELETED] ${issue.title}`,
      body: `*This issue was marked as deleted on ${new Date().toISOString()}*\n\n${issue.body || ''}`
    });
    
    console.log(`Marked issue #${issueNumber} as deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting issue #${issueNumber}:`, error);
    throw new Error(`Failed to delete issue #${issueNumber}`);
  }
}