### Feature Category: Community & Discovery

#### **Feature:** Implement the Casting Studio

*   **Context:** This feature provides a public space for authors to showcase their characters and for other authors to discover them for potential collaboration.
*   **Requirements:**
    *   [x] Authors must be able to mark their characters as "publicly listed" to appear in the Casting Studio.
    *   [x] The Casting Studio will display a gallery of all publicly listed characters.
    *   [x] Each character card in the gallery should display key information (name, a short bio snippet) and link to the full character view/travel trunk.
    *   [ ] Implement search and filtering capabilities for the Casting Studio (Post-MVP1).
*   **Technical Approach:**
    *   Add a `listed` boolean column to the `characters` table in `server/db/schema.ts`.
    *   Generate a new database migration for the schema change.
    *   Create a new API endpoint `GET /api/casting-studio` to fetch all listed characters.
    *   Create a new API endpoint `PATCH /api/characters/:id` to update the `listed` status.
    *   Create a `CastingStudio.vue` component to display the characters.
    *   Add a toggle switch to the character management UI to allow authors to list/unlist their characters.
*   **Acceptance Criteria:**
    *   [x] An author can toggle the visibility of their character in the Casting Studio.
    *   [x] The Casting Studio page displays all characters marked as public.
    *   [x] Clicking on a character in the studio navigates to the character's detail page.
*   [ ] **Notes/Considerations:** The initial implementation will be a simple gallery. Search and filtering will be added later.