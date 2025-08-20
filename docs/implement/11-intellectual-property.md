### Task Category: Intellectual Property Management

#### **Task Title:** Implement Basic IP Attribution Display

*   **Labels:** `feature`, `frontend`, `attribution`, `IP`, `MVP1`
*   **Assignees:** [Suggested Assignee(s)]

**Description:**

*   **Context:** This task involves displaying the attribution information linked to the author's DID for each contribution, laying the foundation for intellectual property management as described in `product-plan.md` and the "Intellectual Property (IP) Clarity" section of `functional-spec.md`.
*   **Requirements:**
    *   [ ] Retrieve the author's DID associated with each contribution.
    *   [ ] Display the author's identity (e.g., a username linked to their DID) alongside their contributions in the writing environment and other relevant views.
    *   [ ] Provide a way for users to view the verifiable link between the contribution and the DID (e.g., a tooltip or a dedicated view).
*   **Technical Approach:** Modify frontend components to fetch and display attribution data. Implement UI elements to show the author's identity and the link to the DID.
*   **Acceptance Criteria:**
    *   [ ] Attribution information is visible for each contribution.
    *   [ ] The displayed attribution is linked to the author's DID.
    *   [ ] Users can understand who made a specific contribution.
*   **Notes/Considerations:** Consider how to display DIDs in a user-friendly manner (e.g., resolving to a username or profile).