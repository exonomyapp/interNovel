# Local Data Management with IndexedDB

This document outlines the schema and structure for data stored locally in the user's browser using IndexedDB for the Issueman application.

## 1. Introduction

Brief overview of why IndexedDB is used (offline capabilities, performance, etc.) and the name of the database (`issueman_db`).

## 2. Database Versioning

Explanation of how database schema versions and upgrades will be handled. This typically involves incrementing a version number when the schema changes and using the `onupgradeneeded` event in IndexedDB to apply migrations (creating new object stores, adding or removing indexes, modifying existing stores).

## 3. Object Stores

Details for each object store:

### 3.1. `issues`

*   **Purpose:** Stores individual issue details.
*   **Primary Key:** `id` (STRING, UUID)
*   **Fields:**
    *   `id`: STRING (Primary Key) - Unique identifier for the issue (e.g., UUID).
    *   `number`: INTEGER - Human-readable, locally unique issue number.
    *   `title`: STRING - The title of the issue.
    *   `description`: TEXT - A detailed description of the issue.
    *   `status`: STRING - Current status of the issue (e.g., "open", "in_progress", "closed", "todo").
    *   `priority`: STRING - Priority level (e.g., "low", "medium", "high", "critical").
    *   `created_at`: DATETIME - ISO 8601 string timestamp of when the issue was created.
    *   `updated_at`: DATETIME - ISO 8601 string timestamp of the last update.
    *   `creator_id`: STRING - Identifier of the user who created the issue.
    *   `assignee_id`: STRING (nullable) - Identifier of the user assigned to the issue.
    *   `labels`: ARRAY_OF_STRINGS - A list of labels associated with the issue (e.g., `["bug", "feature"]`).
    *   `parent_issue_id`: INTEGER (nullable) - The `number` of the parent issue, if this is a sub-task/child issue. References `issues.number`.
*   **Indexes:**
    *   `number_idx`: on `number` (unique: true)
    *   `status_idx`: on `status`
    *   `priority_idx`: on `priority`
    *   `created_at_idx`: on `created_at`
    *   `updated_at_idx`: on `updated_at`
    *   `assignee_id_idx`: on `assignee_id`
    *   `labels_idx`: on `labels` (multiEntry: true)
    *   `parent_issue_id_idx`: on `parent_issue_id` (to find child issues)

### 3.2. `comments`

*   **Purpose:** Stores comments related to issues.
*   **Primary Key:** `id` (STRING, UUID)
*   **Fields:**
    *   `id`: STRING (Primary Key) - Unique identifier for the comment (e.g., UUID).
    *   `issue_id`: STRING (Foreign Key) - References `issues.id`.
    *   `body`: TEXT - The content of the comment.
    *   `created_at`: DATETIME - ISO 8601 string timestamp of when the comment was created.
    *   `updated_at`: DATETIME - ISO 8601 string timestamp of the last update.
    *   `creator_id`: STRING - Identifier of the user who created the comment.
*   **Indexes:**
    *   `issue_id_idx`: on `issue_id`
    *   `created_at_idx`: on `created_at`

### 3.3. `users` (Optional but Recommended)

*   **Purpose:** Caches basic user information locally if needed (e.g., display names, avatars). This can simplify displaying user-related info without needing complex joins or repeated fetches if user data comes from elsewhere.
*   **Primary Key:** `id` (STRING, user identifier)
*   **Fields:**
    *   `id`: STRING (Primary Key) - Unique user identifier.
    *   `username`: STRING (Unique username)
    *   `displayName`: STRING - User's display name.
    *   `avatar_url`: STRING (nullable) - URL to user's avatar.
*   **Indexes:**
    *   `username_idx`: on `username` (unique: true)

## 4. Relationships

*   **Issue to Comments (One-to-Many):** An issue can have multiple comments. This is modeled by storing `issue_id` in each comment object.
*   **User Involvement (Creator/Assignee):** `creator_id` and `assignee_id` fields link issues and comments to users. If the `users` object store is implemented, these IDs would reference `users.id`.
*   **Parent-Child Relationships Between Issues (Hierarchical):**
    *   An issue can be a child of another issue. This relationship is stored by setting the `parent_issue_id` field on the *child issue* to the `number` of the *parent issue*.
    *   **Establishing Relationships:** These relationships are primarily established by server-side logic (found in `server/api/index.ts` within the `processChildReferences` function) when an issue's description is processed during creation or update. The server parses the description for:
        1.  **Inline Child References:** The system scans the issue body for various inline formats that reference child issue numbers. The specific regular expressions for these formats are implemented in the backend.
        2.  **"### Children:" Markdown Section:** A dedicated markdown section starting with the heading `### Children:` can be used. Issue numbers listed under this heading will be identified as children of the current issue. Supported list formats for child issue numbers (e.g., `#123`) include:
            *   Bulleted items: `- #123` or `* #123`
            *   Numbered items: `1. #456`
            *   Task list items: `[ ] #789` or `[x] #789`
    *   When child issues are identified through these parsing methods, the server updates each identified *child issue* by setting its `parent_issue_id` field to the `number` of the issue whose description contained these references.
    *   **Direct Assignment:** It's also possible to set the `parent_issue_id` directly in the request body when creating or updating an issue, which bypasses the description parsing logic if the parent is already known.
    *   **Local Storage:** The `parent_issue_id` field in the local `issues` object store stores the `number` (INTEGER) of the parent issue.
    *   Retrieving all direct children of a parent issue can be done by querying the local `issues` store where `parent_issue_id` matches the parent's `number`.

## 5. Data Synchronization Strategy (Future Consideration)

Brief mention of how this local schema might interact with a remote backend in the future, if applicable (e.g., syncing strategies, conflict resolution - high-level). For instance, issues might have a `remote_id` and a `last_synced_at` timestamp.
