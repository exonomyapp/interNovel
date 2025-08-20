### Task Category: Database and Backend

#### **Task Title:** Design and Implement Database Schemas (OrbitDB and PostgreSQL with Drizzle ORM)

*   **Labels:** `backend`, `database`, `infrastructure`, `MVP1`
*   **Assignees:** [Suggested Assignee(s)]

**Description:**

*   **Context:** This task involves designing and implementing a dual-database architecture. OrbitDB, built on Internovel's server-side Helia IPFS, will serve as the primary, immutable source of truth for all user-generated content, ensuring data availability and replication. A server-side PostgreSQL database will function as a read-optimized cache. Data from OrbitDB will be transformed and synchronized to the relational PostgreSQL schema via event-driven triggers. The Internovel UI will query this PostgreSQL cache to ensure a responsive user experience.
*   **Requirements:**
    *   [x] Design a relational schema for PostgreSQL using Drizzle ORM that can efficiently store and serve data for user profiles, novels, characters, contributions, and all other MVP1 features. This schema is for reading and UI display.
    *   [ ] Define and document the OrbitDB document schema in `docs/implement/13-orbitdb-schema.md`. This schema will define the structure of the "source of truth" data.
    *   [ ] Implement a synchronization mechanism that listens for changes in OrbitDB and updates the PostgreSQL database accordingly.
    *   [ ] Ensure the transformation logic correctly maps the OrbitDB document model to the PostgreSQL relational model.
    *   [ ] Configure the application to write to OrbitDB and read from PostgreSQL.
*   **Technical Approach:** Define the PostgreSQL schema using Drizzle ORM syntax. Develop a service that subscribes to OrbitDB update events. This service will contain the logic to transform the incoming data and upsert it into the PostgreSQL database. Drizzle will also be used to manage schema migrations, which may be triggered by changes in the OrbitDB data structure.
*   **Acceptance Criteria:**
    *   [x] A comprehensive relational schema for the PostgreSQL read-cache is defined using Drizzle ORM.
    *   [ ] A clear document schema for OrbitDB is established.
    *   [ ] The application successfully writes all content updates to OrbitDB.
    *   [ ] The synchronization service reliably updates the PostgreSQL cache in near real-time in response to OrbitDB changes.
    *   [ ] The application's read queries are all directed at and successfully served by the PostgreSQL cache.
    *   [x] The schema supports the data requirements of all MVP1 features.
*   **Notes/Considerations:** Consider indexing for performance. Design for scalability and future extensions.

#### **Task Title:** Implement Core Backend API Endpoints (Nuxt.js 3 Server)

*   **Labels:** `backend`, `API`, `MVP1`
*   **Assignees:** [Suggested Assignee(s)]

**Description:**

*   **Context:** This task focuses on implementing the necessary backend API endpoints using Nuxt.js 3 server-side capabilities to handle data interactions for all MVP1 features, as described in the "API Structure" section of `product-plan.md`.
*   **Requirements:**
    *   [x] Implement endpoints for user authentication (DID-based).
    *   [ ] Implement endpoints for managing novels, Vertebrae, themes, and topics.
    *   [x] Implement endpoints for managing characters and Character Travel Trunks.
    *   [x] Implement endpoints for handling proposals.
    *   [x] Implement endpoints for community features (listing and retrieving data for Casting Studio and Novel Café).
    *   [ ] Implement endpoints for managing permissions.
    *   [ ] Implement endpoints for handling external service integration (OAuth callbacks, file operations).
    *   [ ] Implement endpoints for moderation workflows.
*   **Technical Approach:** Utilize Nuxt.js 3 server routes to define API endpoints. Implement logic within these endpoints to interact with the database (using Drizzle ORM) and external services.
*   **Acceptance Criteria:**
    *   [ ] All necessary API endpoints for MVP1 features are implemented.
    *   [ ] Endpoints correctly interact with the database and external services.
    *   [ ] Endpoints are protected by appropriate authentication and authorization checks.
*   **Notes/Considerations:** Design a consistent API structure and naming convention. Implement input validation and error handling.