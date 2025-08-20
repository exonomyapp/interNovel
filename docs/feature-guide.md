# InterNovel Feature Roadmap

This document provides a high-level roadmap of the key features planned for the InterNovel platform, intended for project management and tracking development progress.

## Undocumented Implementations
The following technologies are implemented in the codebase but are not yet reflected in the official documentation:
*   **Pinia:** Used for state management across the application.
*   **Drizzle ORM:** The database is managed with the Drizzle ORM. The `users` table schema has been updated to include `email`, `name`, and `avatar_url` fields to support user profiles.
*   **Tailwind CSS:** The UI is built with Tailwind CSS, not Vuetify.

## MVP1 Features

*   [x] **Decentralized Identity and Attribution:** Implement DID-based user identities and cryptographic linking of contributions for immutable attribution.
    *   **Implementation:**
        *   `useDidStore` manages DID creation and retrieval.
        *   `jose` is used for creating and verifying JSON Web Tokens (JWTs) for session management. `2024-07-22 18:12`
*   [x] **User Authentication and Profile Management:** Users can register, log in, and manage their profiles, including uploading an avatar.
    *   **Implementation:**
        *   `server/middleware/auth.ts` protects routes. `2024-07-22 18:16`
        *   `server/api/auth/register.post.ts` handles user registration.
        *   `server/api/auth/login.post.ts` handles user login.
        *   `server/api/profile/index.get.ts` retrieves user profile data. `2024-07-22 18:20`
        *   `server/api/profile/avatar.post.ts` handles avatar uploads. `2024-07-22 18:17`
        *   UI components for registration, login, and profile management have been created in `components/auth` and `components/profile`. `2024-07-22 18:18`
*   [ ] **Collaborative Writing Environment:** Establish the basic real-time collaboration features, including presence indicators, updates, notifications, and core writing tools.
*   [ ] **Authorization and Moderation:** Set up the tiered authorization system and moderation process, particularly for student accounts.
*   [x] **Novel Spine:** Build the core structure for non-linear idea development, including Vertebrae, time stamping, and tagging.
    *   **Implementation:**
        *   `useNovelStore` and `useVertebraStore` manage novel and vertebrae data.
*   [x] **Character Travel Trunk:** Develop the functionality for authors to propose and integrate characters into other novels.
    *   **Implementation:**
        *   Database schema created for characters, travel trunks, and proposals.
        *   API endpoints created for managing characters and travel trunks.
        *   Basic UI component created for displaying the travel trunk.
*   [x] **Casting Studio:** Create the platform for showcasing and discovering characters for collaboration.
    *   **Implementation:**
        *   `useCastingStore` manages character availability.
        *   API endpoints created for listing and updating characters.
*   [x] **Novel Café:** Develop the space for showcasing novels and facilitating collaboration calls.
    *   **Implementation:**
        *   `useCafeStore` manages showcased novels.

## Post-MVP1 Features (Future Vision)

*   [ ] Enhanced DID Management (WebAuthn, external wallets)
*   [ ] Decentralized Storage Options (OrbitDB, in tandem with Supabase for resilient content hosting)
*   [ ] Advanced Collaborative Tools (version control, branching, co-editing, analytics)
*   [ ] Expanded Community & Discovery (advanced filtering, recommendations, writing groups, events)
*   [ ] Monetization & Licensing (DID-based frameworks)

This roadmap will be updated as development progresses and priorities evolve. More detailed specifications for each feature can be found in the Functional Specification document.