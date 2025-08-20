### Task Category: OrbitDB Schema Definition

**Description:**

This document outlines the schema for the document-based data stored in OrbitDB, which serves as the primary source of truth for the Internovel application. All write operations are directed to OrbitDB, and the data is subsequently synchronized to a PostgreSQL read-cache.

**Schema Version:** 1.0

---

#### **User Profile (`users` store)**

*   **Type:** `docstore`
*   **Key:** User's DID (`did:peer`)

**Fields:**

*   `did` (String): The user's Decentralized Identifier. (Primary Key)
*   `displayName` (String): The user's display name.
*   `avatarUrl` (String): A URL to the user's avatar image, likely stored on IPFS.
*   `createdAt` (Timestamp): The timestamp of when the user profile was created.
*   `updatedAt` (Timestamp): The timestamp of the last profile update.

---

#### **Novels (`novels` store)**

*   **Type:** `docstore`
*   **Key:** Unique Novel ID (e.g., UUID)

**Fields:**

*   `novelId` (String): Unique identifier for the novel. (Primary Key)
*   `ownerDid` (String): The DID of the user who owns the novel.
*   `title` (String): The title of the novel.
*   `description` (String): A brief description of the novel.
*   `createdAt` (Timestamp): The timestamp of when the novel was created.
*   `updatedAt` (Timestamp): The timestamp of the last update.

---

*Further schema definitions for Characters, Contributions, etc., will be added here as they are developed.*