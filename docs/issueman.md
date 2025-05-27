# GitHub Issue Management Tool Documentation

This document outlines the current state and future plans for the InterNovel GitHub Issue Management Tool, a specialized application designed to provide enhanced management capabilities for GitHub issues, particularly focusing on creating, visualizing, and navigating parent-child relationships between issues.

## Project Overview

The InterNovel Issue Management Tool extends GitHub's native issue tracking functionality with additional features:

1. **Hierarchical Organization**: Visualize and manage parent-child relationships between issues using a tree-based interface
2. **Enhanced Description Editing**: Tabbed markdown editor with live preview for issue descriptions
3. **Automation Support**: Specialized UI for automation tasks with progress tracking and status indicators
4. **Parent-Child Relationship Management**: Establish parent-child relationships through structured task lists (using "- [ ] #X" format)
5. **Link Enhancement**: Automatic enhancement of task list references with issue titles and links
6. **Full Issue and Comment Management**: Complete CRUD operations for both issues and their comments
7. **GitHub User Integration**: Authentication with GitHub to provide a user-centric view of issues and comments

## UI Layout Design

The application follows a structured CSS Grid layout for consistent organization of content:

### Primary Grid Layout
- **Top Navbar** (1fr): Contains application title and global actions
- **Application Pane** (8fr): The main application area, divided into:
  - **User Navbar** (1fr): Left sidebar for user authentication and the Issue Tree
  - **Content Pane** (5fr): Main content area for issue management

### Content Pane Grid Layout
The Content Pane uses a nested grid layout with three sections:
- **Issues List** (3fr): Lists all issues with filtering capabilities
- **Issue Details** (3fr): Displays details of the selected issue
- **Comments Section** (5fr): Shows comments for the selected issue

### User Authentication
The User Navbar includes GitHub authentication:
- GitHub login button for unauthenticated users
- User profile dropdown showing GitHub avatar and username
- User-centric filtering of issues based on GitHub identity

### CSS Grid Enforcement

The application now enforces the use of CSS Grid for all major UI components. Flexbox is reserved for micro-componentry. The main layout has been updated to use CSS Grid, with defined grid areas for the header, sidebar, and main content.

## Implementation Status and Task List

### 1. **Application Foundation**
- [x] Scaffold the Nuxt 3 application in the current working directory
- [x] Install and configure Vuetify for UI components
- [x] Set up the project structure for backend API and GitHub communications
- [x] Implement event bus for cross-component communication
- [x] Implement CSS Grid layout for consistent UI structure

### 2. **Backend API Development**
- [x] Create endpoints for fetching issues and comments from GitHub
- [x] Implement GitHub authentication using a personal access token (Backend implemented)
- [x] Develop API for updating issue descriptions
- [x] Implement automatic issue relationship detection in descriptions
- [x] Develop automatic enhancement of issue references with titles and links
- [x] Implement comprehensive error handling and logging for API requests
- [x] Add support for comments retrieval and management
- [x] Implement full CRUD operations for issues and comments

### 3. **Data Storage and Management**
- [ ] Implement IndexedDB integration for offline capabilities
    - [ ] 1. Define Local Data Schema for issues, comments, and relationships in IndexedDB.
    - [ ] 2. Create an IndexedDB Service/Wrapper (Nuxt 3 composable) for CRUD operations, transactions, and versioning.
    - [ ] 3. Implement Data Hydration and Caching Strategy: Store/update data from GitHub API into IndexedDB when online.
    - [ ] 4. Implement Offline Data Access: Modify UI components to read from IndexedDB when offline.
    - [ ] 5. Implement Online/Offline Status Detection to switch data sources.
    - [ ] 6. Implement Basic Offline Read-Only: Disable data modification UI when offline. (Note: Advanced offline support with change queuing and sync is a future task under "Develop synchronization logic...").
    - [ ] 7. Implement User Interface Considerations for Offline/Stale Data:
        - Display a clear "Offline Mode" message.
        - Show the timestamp of the last successful synchronization (e.g., "Data last updated: [Date & Time]").
        - When online and discrepancies are found (server has newer data):
            - Notify the user that updates are available.
            - Offer to update local data (e.g., via "refresh" or "reload" mechanisms) with user consent (no automatic refresh).
            - (Note: Conflict resolution for local offline changes is out of scope for initial offline implementation).
    - [ ] 8. Implement Error Handling and Storage Management for IndexedDB:
        - Handle IndexedDB errors (e.g., storage full, transaction failures).
        - Integrate with existing "refresh" (component-specific) and "reload" (global event) UI components:
            - "Refresh": If online, re-fetch from API & update IndexedDB. If offline, re-read from IndexedDB.
            - "Reload": If online, could trigger a broader sync check. If offline, ensure UI reflects IndexedDB.
        - Provide a mechanism for users to clear local IndexedDB cache if needed.
- [ ] Define comprehensive data schema for issues and relationships (This task is now covered by sub-task 1 of "Implement IndexedDB integration...")
- [ ] Develop advanced synchronization logic between GitHub and local storage (e.g., handling local modifications made offline, conflict resolution, background sync). The existing "refresh" and "reload" functionalities will be enhanced to work with the local cache and trigger appropriate sync actions when online.
- [ ] Implement local search functionality across issues

### 4. **GitHub Integration**
- [x] Integrate Octokit to interact with GitHub API
- [x] Implement functions for fetching and updating issues
- [x] Develop parent-child relationship detection in issue bodies
- [x] Create enhanced reference linking for better issue visibility
- [x] Implement comprehensive commenting functionality
- [ ] Implement efficient API call batching to respect GitHub rate limits
- [ ] Implement GitHub user authentication for personalized views

### 5. **UI Components and Features**
- [x] Design and implement hierarchical tree view for issue relationships
- [x] Create detailed issue view with metadata display
- [ ] Develop tabbed markdown editor with preview functionality (Code evidence not found; likely not yet implemented)
- [x] Implement child issues listing in parent issue view
- [x] Develop automation status dashboard for AI task issues
- [x] Add comment management interface with full CRUD capabilities
- [x] Implement consistent CSS Grid layout for the application
- [x] Create user authentication UI in the left sidebar (Mock implementation)
- [ ] Add drag-and-drop functionality for rearranging issue relationships
- [ ] Implement bulk editing capabilities for multiple issues
- [ ] Add filtering and sorting options for the issues list

### 6. **Parent-Child Relationship Management**
- [x] Implement relationship detection based on task list format ("- [ ] #X")
- [x] Develop automatic parent field addition to child issues
- [x] Create bidirectional relationship preservation
- [x] Implement reference enhancement with issue titles
- [ ] Develop visualization improvements for complex relationship hierarchies
- [ ] Add relationship validation to prevent circular dependencies

### 7. **Automation Support**
- [x] Implement special UI for automation/AI task issues
- [x] Create status tracking for automation tasks
- [x] Add progress indicators and timeline view
- [ ] Develop automation triggering mechanisms
- [ ] Implement comprehensive logging for automation processes
- [ ] Add result visualization for completed automation tasks

### 8. **User Experience Enhancements**
- [ ] Implement markdown preview for issue descriptions
- [ ] Add contextual actions based on issue types
- [ ] Develop keyboard shortcuts for common actions
- [ ] Implement notifications for issue updates
- [ ] Create comprehensive help documentation
- [ ] Add user preferences and settings

### 9. **Testing and Deployment**
- [ ] Implement comprehensive unit testing
- [ ] Develop integration tests for GitHub API interactions
- [ ] Create end-to-end tests for critical user flows
- [ ] Optimize performance for large issue sets
- [ ] Deploy the application to production environment

## Technical Implementation Details

### UI Layout with CSS Grid

The application uses CSS Grid for a consistent and responsive layout:

1. **Main Layout Grid**:
   ```css
   .app-layout {
     display: grid;
     grid-template-rows: 1fr 8fr;
     height: 100vh;
   }
   ```

2. **Application Pane Grid**:
   ```css
   .app-pane {
     display: grid;
     grid-template-columns: 1fr 5fr;
   }
   ```

3. **Content Pane Grid**:
   ```css
   .content-grid {
     display: grid;
     grid-template-rows: 3fr 3fr 5fr;
   }
   ```

This grid-based approach ensures:
- Consistent spacing and alignment across the application
- Proper allocation of screen real estate according to content importance
- Responsive behavior that adapts to different screen sizes
- Clear separation of functional areas within the application

### GitHub User Integration

The application integrates with GitHub's user system to provide a personalized experience:

1. **Authentication**:
   - Users can log in with their GitHub accounts
   - Authentication uses OAuth to securely connect to GitHub

2. **User Context**:
   - Issues and comments are displayed with user context
   - User avatars and names are shown for all interactions
   - Filter options allow viewing issues created by or assigned to the current user

3. **Personalized Views**:
   - The issue list can be filtered to show only issues relevant to the logged-in user
   - Comments from the current user are visually distinguished
   - User-specific actions are available based on permissions

### Parent-Child Relationship Management

The system manages parent-child relationships between issues primarily through server-side logic located in `server/api/index.ts` (specifically the `processChildReferences` function). This logic is triggered when an issue is created or its description is updated.

1.  **Detection & Establishment from Issue Descriptions**:
    The server parses the parent issue's description to identify child issues in two main ways:
    *   **Inline Child References**: The system scans the issue body for various inline formats that reference child issue numbers (e.g., `Relates to #123`, `Child: #456`). The specific regular expressions for these formats are implemented in the backend.
    *   **"### Children:" Markdown Section**: A dedicated markdown section in the parent issue's description, starting with the heading `### Children:`, is parsed. Issue numbers listed under this heading are identified as children. Supported list formats for child issue numbers (e.g., `#123`) include:
        *   Bulleted items: `- #123` or `* #123`
        *   Numbered items: `1. #456`
        *   Task list items: `[ ] #789` or `[x] #789` (Note: while `issueman.md` previously mentioned only `"- [ ] #X"`, the backend supports a broader range of list formats under this section).

2.  **Storage**:
    *   When child issues are identified through the parsing methods above, the server updates each identified *child issue* by setting its `parentId` field to the `number` of the parent issue. This `parentId` is then stored locally in IndexedDB as described in `local-data.md`.
    *   **Direct Assignment**: It is also possible to set the `parentId` directly in the request body when creating or updating an issue, which bypasses the description parsing logic if the parent is already known.
    *   The parent issue's description, containing the "### Children:" section or inline references, is stored as-is. The application does *not* automatically add a "### Parent:" section to the child issue's description; the linkage is primarily through the `parentId` field on the child.

3.  **Visualization**:
    The `TreeNav` component and other UI elements construct a hierarchical view by:
    *   Building a map of all issues.
    *   Primarily relying on the `parentId` property of issues to establish relationships.
    *   The UI may also visually interpret the "### Children:" section in a parent's description for display purposes or as a secondary cue.
    *   Rendering the resulting tree structure with collapsible branches.

### Markdown Editing

The issue description editor features:

1. A tabbed interface with:
   - Raw markdown editing tab with syntax highlighting
   - Live preview tab showing rendered markdown
   
2. Enhanced markdown features:
   - Automatic link enhancement for issue references
   - GitHub-compatible rendering of all markdown elements
   - Preview that matches GitHub's styling

### Automation Support

For issues tagged with automation labels or prefixes:

1. A specialized dashboard displays:
   - Current status (pending, in-progress, completed, failed)
   - Progress indicators
   - Priority level
   - Timeline of actions taken

2. Control interfaces provide:
   - Ability to trigger automation processes
   - Option to stop running automations
   - Refresh functionality for status updates

## Future Development Plans

Upcoming enhancements will focus on:

1. **Offline Capability**: Complete IndexedDB integration for full offline functionality.

2. **Advanced UI Features**: Implement drag-and-drop relationship management, bulk editing, and enhanced filtering.

3. **Advanced Automation**: Develop comprehensive automation tools with direct integration to GitHub Actions.

4. **Performance Optimization**: Improve data loading and caching for handling large issue sets.

5. **Enhanced Collaboration**: Add real-time updates and improved comment functionality.

6. **User Experience Improvements**: Enhance the GitHub user integration with more personalized views and filters.

---

This document will continue to be updated as the project evolves. For detailed technical information, refer to the code documentation and other resources in the `/docs` directory.
