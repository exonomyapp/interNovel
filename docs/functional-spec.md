# InterNovel Functional Specification

This document provides detailed functional specifications for the features outlined in the InterNovel Feature Roadmap.

## 1. Fair Attribution

**Problem:** Ensuring each contributor receives clear and undeniable credit for their specific inputs.

**Proposal:** Implement a DID-based attribution system where all creative contributions (paragraphs, character elements, plot points) are cryptographically linked to the author's DID.

*   **Details:**
    *   Use W3C Decentralized Identifiers (DIDs) to anchor user identities.
    *   Cryptographically sign contributions with the author's DID.
    *   Display attribution information clearly and transparently within the platform.
*   **UX Principles:** Clarity, Simplicity & Intuitiveness
*   **Notes for Developers:** Integrate with the existing DID management system.

## 2. Technical Overhead & External Service Integration

**Problem:** Managing version control, document storage, collaborative permissions, and leveraging external tools can be cumbersome.

**Proposal:** Streamline document management and provide flexible integration with a variety of external services through optional third-party authentication.

*   **Details:**
    *   **Document Storage Integration:** Allow users to connect accounts from third-party services (e.g., GitHub, GitLab, Google Docs) to store the actual text files of their novels.
    *   **Broader External Service Integration:** Support connecting accounts from various third-party service providers beyond just document storage.
    *   **Optional Third-Party Authentication:** Implement a mechanism for users to optionally authenticate with third-party services. This authentication is separate from the core InterNovel platform authentication and is not required for basic platform usage.
    *   **Leveraging External Resources:** Enable users to leverage features and resources from connected third-party services that can enhance their writing process. Examples include:
        *   Accessing cloud storage for research materials or backups.
        *   Integrating with grammar and style checking APIs.
        *   Connecting to research databases or knowledge graphs.
        *   Utilizing image or media libraries.
    *   **Secure Protocol Usage:** Use secure protocols like OAuth 2.0 to allow users to grant the platform specific permissions to interact with these chosen services on their behalf, ensuring user data privacy and security.
    *   **Abstracted Complexity:** Abstract the technical complexity of external service integration and authentication from the user, providing a simple and intuitive interface for connecting and managing third-party accounts.
*   **UX Principles:** Simplicity & Intuitiveness, Clarity, Flexibility
*   **Notes for Developers:** Implement a flexible OAuth 2.0 (or similar) integration framework. Design a system for managing third-party service connections and permissions. Research and prioritize potential external service integrations based on user needs. Address security implications of handling third-party credentials and data access.

## 3. Intuitive Collaborative Writing Environment

**Problem:** Providing a user-friendly and efficient environment for collaborative writing.

**Proposal:** Build a responsive and intuitive writing environment with real-time collaboration features.

*   **Details:**
    *   Use Nuxt.js 3 and Pinia for the frontend.
    *   Implement presence indicators, near real-time updates, and activity notifications.
    *   Include core writing tools, simplified version tracking, and tools for managing sections, themes, and topics.
    *   Implement a granular permission system.
*   **UX Principles:** Simplicity & Intuitiveness, Engagement
*   **Notes for Developers:** Focus on performance and responsiveness.

## 4. Authorization and Moderation

**Problem:** Managing user permissions and content moderation, particularly within educational settings.

**Proposal:** Implement a tiered authorization system and moderation process.

*   **Details:**
    *   **Authorization Levels:** Admin, Moderator, Creator.
    *   **Moderator Approval:** Moderators must approve creations of Creators.
    *   **Student Account Moderation:** Student accounts created by a Moderating teacher require approval from the teacher and optionally other collaborators.
*   **UX Principles:** Clarity, Flexibility
*   **Notes for Developers:** Define roles and permissions, implement approval workflows.

## 5. Non-Linear Idea Development

**Problem:** Supporting the often non-sequential way authors develop story ideas and narrative arcs.

**Proposal:** Enhance the "Novel Spine" feature to allow authors to capture and organize ideas in a non-linear manner while maintaining an underlying chronological framework.

*   **Details:**
    *   Allow authors to create "Vertebrae" representing core ideas, plot points, or thematic elements.
    *   Enable manual time stamping of Vertebrae to establish an inherent chronological sequence.
    *   Enable tagging and categorization of Vertebrae with relevant themes and topics.
    *   Provide a visual overview of the Novel Spine, allowing authors to rearrange Vertebrae and experiment with different storylines, while the time stamps provide a reference for the original chronological order. This allows authors to creatively conceal or reveal the cause and effect sequence in the final presentation.
*   **UX Principles:** Flexibility, Engagement, Clarity
*   **Notes for Developers:** Integrate manual time stamping functionality with the existing Novel Spine feature and ensure the visual overview clearly displays both the arranged order and the underlying chronological order based on time stamps.

## 6. Character Portability & Cross-Narrative Potential

**Problem:** Enabling characters to organically exist and evolve across different stories and authorial domains.

**Proposal:** Further develop the "Character Travel trunk" concept to facilitate character portability and cross-narrative potential.

*   **Details:**
    *   Allow authors to define detailed character bios, thematic preferences, and writing samples.
    *   Provide tools for managing character permissions and licensing.
    *   Enable authors to track the usage of their characters in other stories.
*   **UX Principles:** Flexibility, Engagement
*   **Notes for Developers:** Integrate with the DID-based attribution and licensing systems.

## 7. Discoverability and Community Features (Overview)

**Problem:** Enabling authors to find fitting collaborators or allow their creative assets (like characters and novels) to be discovered and integrated into new narratives.

**Proposal:** Enhance community features to facilitate character and novel discovery and collaboration.

## 8. The Casting Studio: Functional Specification

**Problem:** Providing a dedicated space for authors to showcase and discover characters for collaboration.

**Proposal:** Implement a "Casting Studio" feature with character listing, discovery, and proposal initiation capabilities.

*   **Details:**
    *   **Character Showcase:** A dedicated area where authors can publicly or semi-publicly list their original characters, complete with their "Character Travel trunks" (bio, thematic preferences, writing samples from the character's original author).
    *   **Discovery Hub:** Allows authors to browse and search for characters developed by others, potentially filtering by themes, topics, or character traits.
    *   **Facilitating Collaboration:** Authors who discover a character in the Casting Studio can initiate a proposal to the character's original author, outlining how they wish to integrate that character into their novel.
    *   **Focus on Character IP:** The Casting Studio emphasizes the portability and collaborative potential of individual characters as distinct creative assets.
*   **UX Principles:** Engagement, Simplicity & Intuitiveness
*   **Notes for Developers:** Implement search, filtering, and proposal initiation workflows.

## 9. The Novel Café: Functional Specification

**Problem:** Providing a dedicated space for authors to showcase novels and find collaborators.

**Proposal:** Implement a "Novel Café" feature with novel listing, collaboration calls, and discovery capabilities for collaborators.

*   **Details:**
    *   **Novel Showcase:** A dedicated space where authors can feature their novels (or works-in-progress), providing summaries, genre information, and current status.
    *   **Collaboration Calls:** Authors can express their desire for collaborators on specific novels, outlining what kind of contributions or co-authors they are seeking.
    *   **Discovery for Collaborators:** Allows authors looking for projects to join to browse novels, understand their themes and needs, and connect with the original authors to offer collaboration.
    *   **Fostering New Writing Partnerships:** The Novel Café aims to connect authors for co-creation of entire narratives or significant parts thereof.
*   **UX Principles:** Engagement, Simplicity & Intuitiveness
*   **Notes for Developers:** Implement novel listing, collaboration call features, and discovery tools for collaborators.

## 10. Intellectual Property (IP) Clarity

**Problem:** Defining and protecting ownership rights in a multi-author environment.

**Proposal:** Develop a DID-based licensing framework that allows authors to define and manage the usage rights for their creative assets.

*   **Details:**
    *   Allow authors to specify licensing terms for their contributions (e.g., Creative Commons, proprietary).
    *   Use DIDs to track and enforce licensing agreements.
    *   Provide tools for resolving IP disputes.
*   **UX Principles:** Clarity, Flexibility
*   **Notes for Developers:** Research existing DID-based licensing standards.

## 11. Accessibility for Young Creators

**Problem:** Providing tools that are powerful yet not overwhelmingly technical for emerging writers.

**Proposal:** Prioritize simplicity and intuitiveness in the design of all features, abstracting technical complexities and providing clear explanations.

*   **Details:**
    *   Use a visually appealing and interactive environment.
    *   Provide clear explanations of all features, especially those related to IP, contributions, structure, and themes.
    *   Offer tutorials and help resources for new users.
*   **UX Principles:** Simplicity & Intuitiveness, Clarity
*   **Notes for Developers:** Focus on user-friendly design and clear documentation.

## 12. Structural & Thematic Cohesion

**Problem:** Managing the overall structure (e.g., sections, acts) and maintaining thematic consistency across multiple contributors and evolving narratives.

**Proposal:** Develop tools for defining and managing narrative structure, including sections (e.g., chapters, acts), and for associating and visualizing themes and topics across the novel.

*   **Details:**
    *   Allow authors to define sections and associate them with specific Vertebrae in the Novel Spine.
    *   Provide tools for visualizing the thematic distribution across the novel.
    *   Enable authors to track and manage thematic consistency across multiple contributions.
*   **UX Principles:** Clarity, Engagement
*   **Notes for Developers:** Integrate with the Novel Spine and thematic tagging features.
