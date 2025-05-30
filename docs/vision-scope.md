![image](https://gist.github.com/user-attachments/assets/56bd511c-a834-4c1a-9872-bf16181babe0)

## InterNovel: Vision Scope Document (MVP1)

**Version:** 1.6
**Date:** May 16, 2025

### **1. Introduction & Project Vision**

InterNovel is a revolutionary collaborative writing platform designed to empower authors, particularly young creators such as high school students, to co-create narratives, share worlds, and retain clear ownership of their intellectual contributions. Our vision is to foster a dynamic literary ecosystem where creativity flourishes through seamless collaboration, the discovery of characters and novels, and shared storytelling, underpinned by modern, user-centric technology.

For its Minimum Viable Product (MVP1), InterNovel will manifest as an engaging and intuitive website, built with the Vuetify UI framework for a responsive and efficient user interface. While architected with future decentralization in mind, MVP1 will prioritize a smooth, performant, and centrally-enhanced user experience to ensure accessibility and ease of use for our target audience.

### **2. Core Problem Addressed**

Traditional collaborative writing often struggles with:

*   [**Fair Attribution:** Ensuring each contributor receives clear and undeniable credit for their specific inputs.](functional-spec.md#fair-attribution)
*   [**Intellectual Property (IP) Clarity:** Defining and protecting ownership rights in a multi-author environment.](functional-spec.md#intellectual-property-ip-clarity)
*   [**Non-Linear Idea Development:** Supporting the often non-sequential way authors develop story ideas and narrative arcs.](functional-spec.md#non-linear-idea-development)
*   [**Structural & Thematic Cohesion:** Managing the overall structure (e.g., sections, acts) and maintaining thematic consistency across multiple contributors and evolving narratives.](functional-spec.md#structural--thematic-cohesion)
*   [**Discoverability & Organic Collaboration:** Enabling authors to find fitting collaborators or allow their creative assets (like characters and novels) to be discovered and integrated into new narratives.](functional-spec.md#discoverability-and-community-features-overview)
*   [**Accessibility for Young Creators:** Providing tools that are powerful yet not overwhelmingly technical for emerging writers.](functional-spec.md#accessibility-for-young-creators)
*   [**Character Portability & Cross-Narrative Potential:** Enabling characters to organically exist and evolve across different stories and authorial domains.](functional-spec.md#character-portability--cross-narrative-potential)
*   [**Technical Overhead:** Managing version control, document storage, and collaborative permissions can be cumbersome.](functional-spec.md#technical-overhead--external-service-integration)

InterNovel aims to solve these by integrating decentralized identity principles with user-friendly collaborative, organizational, and discovery tools.

### **3. Target Audience**

*   **Primary:** High school students and young aspiring authors interested in collaborative creative writing, character development, and sharing their literary works.
*   **Secondary:** Hobbyist writers, writing groups, and educators seeking innovative tools for creative projects.

### **4. Key Features & Strategic Pillars (MVP1)**

MVP1 will focus on delivering a core set of features that establish InterNovel's unique value proposition:

#### 4.1. [Decentralized Identity at the Core](functional-spec.md#fair-attribution)

*   **Secure, Self-Managed Identity:** InterNovel provides each user with a secure, self-managed digital identity. This identity is designed to give authors control over their creative work and ensure that their contributions are uniquely and verifiably linked to them.
*   **Immutable Attribution:** All creative contributions (paragraphs, character elements, plot points) will be verifiably linked to the author's identity, providing clear and immutable attribution.

#### 4.2. [The "Character Travel trunk": A Novel Collaborative Paradigm](functional-spec.md#character-portability--cross-narrative-potential)

*   **Inter-Story Character Introduction:** Authors can propose one of their original characters for inclusion in another author's story. This can be a direct proposal to a specific author or initiated after a character is discovered via the "Casting Studio."
*   **Travel trunk Contents (Prepared by Character's Original Author):**
    *   **Character's Narrative Sample:** Specific narrative passage(s) featuring the character, written by their original author.
    *   **Character Biography Link:** A link back to the character's comprehensive bio page on the sending author's InterNovel profile (which includes thematic interests, topical engagements, and preferences).
*   **Proposal by Interested Author:** When an author wishes to invite a character into their novel (either through direct interaction or after discovery in the Casting Studio), they will craft a proposal to the character's original author. This proposal outlines how they envision integrating the character into their story.
*   **Acceptance & Collaboration:**
    *   The character's original author reviews the proposal and the inviting author's novel concept.
    *   If the original author accepts, they can optionally grant the inviting author permissions to use the character and may collaborate on the integration.

#### 4.3. [The "Novel Spine": Flexible Story Structuring](functional-spec.md#non-linear-idea-development)

*   **Idea-Centric Organization:** Authors can construct a "Novel Spine" composed of "Vertebrae," where each Vertebra represents a core idea, plot point, scene concept, or thematic element, rather than a finalized block of text.
*   **Manual Time Stamping:** Vertebrae can be manually time stamped to establish an inherent chronological framework for the narrative.
*   **Tagging & Categorization:** Vertebrae can be tagged with relevant **themes** and **topics** to aid in organization and analysis.
*   **Non-Linear Development:** This allows authors to build the foundational skeleton of their novel in a non-sequential manner, capturing ideas as they emerge, while the time stamps maintain the underlying chronology.
*   **Fleshing Out Ideas:** Authors can associate detailed notes, draft snippets of text, character involvements, or research materials with each Vertebra, "fleshing out" that part of the story at their own pace.
*   **Dynamic Storyline & Section Creation:** Once Vertebrae are established, authors can arrange and rearrange them to experiment with different chronological sequences, complex interwoven storylines, and define logical **sections** or acts within their narrative. The manual time stamps provide a reference for the original chronological order, allowing authors to creatively conceal or reveal the cause and effect sequence in the final presentation.
*   **Visual Overview:** The Spine provides a clear, high-level overview of the novel's structure, progression of ideas, thematic distribution, and underlying chronology, aiding in identifying gaps or areas needing further development and facilitating creative narrative ordering.

#### 4.4. [Intuitive Collaborative Writing Environment](functional-spec.md#intuitive-collaborative-writing-environment)

*   **Smooth and Responsive Interface:** The platform provides a smooth and responsive writing environment designed for easy collaboration.
*   **Simplified Real-Time Collaboration & Awareness (MVP1):** Authors will see who else is working on the novel, get updates in near real-time, and receive notifications about important activity. Authors can also follow novels and characters to stay updated.
*   **Core Writing Tools:** The core writing tools are intuitive and include features for text editing, simplified version tracking, and tools for managing narrative structure, themes, and topics, integrated with the Novel Spine.
*   **Permission System:** Authors will have granular control over who can access and contribute to their work.

#### 4.5. [The "Casting Studio": Character Discovery & Showcase (MVP1 Community Feature)](functional-spec.md#the-casting-studio-functional-specification)

*   **Character Showcase:** A dedicated area where authors can publicly or semi-publicly list their original characters, complete with their "Character Travel trunks" (bio, thematic preferences, writing samples from the character's original author).
*   **Discovery Hub:** Allows authors to browse and search for characters developed by others, potentially filtering by themes, topics, or character traits.
*   **Facilitating Collaboration:** Authors who discover a character in the Casting Studio can initiate a proposal to the character's original author, outlining how they wish to integrate that character into their novel.
*   **Focus on Character IP:** The Casting Studio emphasizes the portability and collaborative potential of individual characters as distinct creative assets.

#### 4.6. [The "Novel Café": Novel Discovery & Collaboration Calls (MVP1 Community Feature)](functional-spec.md#the-novel-café-functional-specification)

*   **Novel Showcase:** A dedicated space where authors can feature their novels (or works-in-progress), providing summaries, genre information, and current status.
*   **Collaboration Calls:** Authors can express their desire for collaborators on specific novels, outlining what kind of contributions or co-authors they are seeking.
*   **Discovery for Collaborators:** Allows authors looking for projects to join to browse novels, understand their themes and needs, and connect with the original authors to offer collaboration.
*   **Fostering New Writing Partnerships:** The Novel Café aims to connect authors for co-creation of entire narratives or significant parts thereof.

#### 4.7. [Flexible External Service Integration & Optional Third-Party Authentication](functional-spec.md#technical-overhead--external-service-integration)

*   **Seamless Integration with External Services:** InterNovel allows authors to easily connect their accounts from various third-party services. While initially focused on document storage providers like GitHub, GitLab, and Google Docs, the platform is designed to support integration with a wider range of services.
*   **Optional Third-Party Authentication:** Beyond core platform authentication, InterNovel supports optional sign-in to third-party services. This is not required for managing content on the InterNovel platform but provides a secondary authentication level.
*   **Leveraging External Resources:** By connecting third-party accounts, authors can leverage the resources and features offered by those service providers that could be useful for their creative process (e.g., accessing cloud storage, utilizing grammar checking tools, integrating with research databases, etc.).

#### 4.8. [Centralized Foundation with Decentralized Aspirations (MVP1)](functional-spec.md#technical-overhead--external-service-integration)

*   **Robust and Reliable Foundation:** The initial version of InterNovel is built on a robust and reliable technical foundation designed to securely manage user data, novel content, and collaboration states.
*   **Future Decentralization:** This architecture is planned to evolve towards greater decentralization in future versions.

#### 4.9. [Authorization and Moderation](functional-spec.md#authorization-and-moderation)

InterNovel will support a tiered authorization system to manage user permissions and content moderation, particularly within educational settings.

*   **Authorization Levels:**
    *   **Admin:** Can create Moderators and Creators.
    *   **Moderator:** Must approve the creations of Creators. An author is automatically the Moderator of their own creation but not of the creation of another author.
    *   **Creator:** Can create content.

*   **Student Account Moderation:**
    *   When a creator is identified as a Student, the moderation process is enforced.
    *   Student accounts will be created by a Moderating teacher.
    *   Students will use the full features of InterNovel to write their novels, but submissions will pass through an approval process that begins with their teacher (acting as a publication Moderator) and is optionally followed by the approval of the other author to whose novel contributions are made.

### **5. User Experience (UX) Principles for MVP1**

Leveraging the Vuetify UI framework to implement these principles. Refer to [Vuetifying.md](Vuetifying.md) for detailed architecture decisions regarding Vuetify.

*   **Simplicity & Intuitiveness:** Prioritize ease of use, especially for the target audience of high school students. Abstract technical complexities.
*   **Engagement:** Create a visually appealing and interactive environment that encourages creativity and collaboration.
*   **Clarity:** Ensure all features, especially those related to IP, contributions, structure, and themes, are clearly explained and transparent.
*   **Flexibility:** Support diverse writing styles and non-linear creative processes through features like the Novel Spine and thematic tagging.
*   **Responsive Design:** Utilize Vuetify's built-in grid system and utility classes to ensure the platform is accessible and provides an optimal viewing and interaction experience across a variety of devices, including desktops, tablets, and smartphones.
*   **Accessibility:** Adhere to web accessibility standards, utilizing Vuetify's accessibility features where applicable.

### **6. Success Metrics for MVP1**

*   User adoption and active engagement (e.g., number of registered users, stories created, "Character Travel trunks" exchanged, characters listed in Casting Studio, novels showcased in Novel Café, follow/subscriptions initiated, Novel Spines utilized, themes/topics defined).
*   Positive user feedback on ease of use and the appeal of core features, including the Casting Studio, Novel Café, and real-time collaborative aspects.
*   Successful implementation of the DID-based attribution system.
*   Stability and performance of the platform, including real-time features.

### **7. Future Vision (Post-MVP1)**

While MVP1 establishes a strong, user-friendly foundation, InterNovel's long-term vision embraces greater decentralization and expanded features:

*   **Enhanced DID Management:** Integration with W3C WebAuthn for even more user-friendly DID authentication. Support for external DID wallets.
*   **Decentralized Storage Options:** Introduction of opt-in decentralized storage solutions like OrbitDB (for MVP2+) for users seeking greater data sovereignty.
*   **Advanced Collaborative Tools:** More sophisticated version control, branching narratives, full co-editing features, and advanced analytics for thematic development and structural balance.
*   **Expanded Community & Discovery:** Enhancing the Casting Studio and Novel Café with more advanced filtering, recommendation algorithms, features for forming writing groups, and hosting collaborative events or challenges.
*   **Monetization & Licensing:** Exploration of DID-based licensing frameworks and potential monetization paths for authors, built upon the foundation of clear IP ownership.

This Vision Scope document will serve as the guiding star for the development of InterNovel's MVP1, ensuring that we deliver a compelling and valuable platform for the next generation of collaborative authors.
