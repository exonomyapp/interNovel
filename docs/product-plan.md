# Internovel Platform: Project Documentation and Technical Overview (Enhanced)

## Table of Contents
1. [Project Vision and Purpose](#project-vision-and-purpose)
2. [Core Value Propositions](#core-value-propositions)
3. [Technical Architecture](#technical-architecture)
   - [System Overview](#system-overview)
   - [Component Structure](#component-structure)
   - [Authentication Architecture](#authentication-architecture)
   - [Database Architecture](#database-architecture)
   - [API Structure](#api-structure)
4. [Multi-Phase Implementation Strategy](#multi-phase-implementation-strategy)
5. [Intellectual Property Management](#intellectual-property-management)
6. [User Experience Design](#user-experience-design)
7. [Roadmap and Development Status](#roadmap-and-development-status)
8. [Development Notes](#development-notes)

## Project Vision and Purpose

The Internovel Platform is a decentralized collaborative writing ecosystem designed to revolutionize how authors create, share, and maintain ownership of their creative work. By combining traditional collaborative features with decentralized identity technology, the platform enables multiple authors to work together while maintaining clear attribution and intellectual property rights for their contributions.

## Target Audience

- **Primary:** High school students and young aspiring authors interested in collaborative creative writing, character development, and sharing their literary works.
- **Secondary:** Hobbyist writers, writing groups, and educators seeking innovative tools for creative projects.

## Core Value Propositions

1. **Decentralized Identity Management**: Ensures that authors maintain control over their identities and contributions through DID-based identity.
2. **Collaborative Writing Tools**: Provides a suite of tools for real-time collaboration, version control, and content management, all delivered in an intuitive writing environment.
3. **Intellectual Property Protection**: Uses DID-based attribution and a future licensing framework to secure and verify ownership of creative works.
4. **Community Engagement**: Facilitates interaction between authors and readers, fostering a vibrant creative community through features like the Casting Studio and Novel Café.
5. **Character Portability**: Enables characters to exist and evolve across different stories via the Character Travel trunk.

## Key Features (MVP1)

This section outlines the core features planned for the Minimum Viable Product (MVP1).

### Decentralized Identity at the Core

Each user's InterNovel identity is anchored to a W3C Decentralized Identifier (DID), utilizing the `did:key` method for MVP1. Users generate and manage their DIDs and keys within the platform using the Web Crypto API, with encrypted private keys stored securely in IndexedDB. Authentication is based on a challenge-response mechanism. All creative contributions are cryptographically linked to the author's DID for immutable attribution.

### The "Character Travel trunk": A Novel Collaborative Paradigm

Allows authors to propose one of their original characters for inclusion in another author's story. The "Travel trunk" includes a narrative sample and a link to the character's bio. Interested authors craft proposals, and the original author can accept and optionally collaborate on the integration.

### The "Novel Spine": Flexible Story Structuring

Enables authors to construct a "Novel Spine" of "Vertebrae," representing ideas, plot points, or thematic elements. Vertebrae can be manually time stamped to establish an inherent chronological framework. Vertebrae can also be tagged with themes and topics, allowing for non-linear development and dynamic arrangement to experiment with storylines and define sections. The Spine provides a visual overview of the novel's structure, thematic distribution, and underlying chronology, which can be creatively concealed by the author when ordering sections of the novel.

### Intuitive Collaborative Writing Environment

Built with Nuxt.js 3, Pinia for state management, and Vuetify for the UI framework, providing a responsive and efficient user interface. Nuxt.js 3 server-side capabilities handle backend logic. MVP1 focuses on simplified real-time collaboration with presence indicators, near real-time updates, activity notifications, and a follow/subscription feature. Core writing tools include text editing, simplified version tracking, and tools for managing sections, themes, and topics integrated with the Novel Spine. A granular permission system allows authors to control access to their works.

### The "Casting Studio": Character Discovery & Showcase (Community Feature)

A dedicated area for authors to publicly or semi-publicly list their characters with their "Character Travel trunks." It serves as a discovery hub for authors to find characters by others and initiate proposals for integration into their novels, emphasizing character portability.

### The "Novel Café": Novel Discovery & Collaboration Calls (Community Feature)

A space for authors to feature their novels and express their need for collaborators. It allows authors looking for projects to browse novels, understand their needs, and connect with original authors to offer collaboration, fostering new writing partnerships.

### Flexible Document Management & External Service Integration

While InterNovel manages metadata and collaborative states, users can connect accounts from third-party services (e.g., GitHub, GitLab, Google Docs) via OAuth 2.0 for storing the actual text files of their novels, abstracting the technical complexity from the user.

### Authorization and Moderation

Supports a tiered authorization system (Admin, Moderator, Creator) and enforces a moderation process for Student accounts, where creations require approval from a Moderating teacher and optionally other authors involved in collaborations.

## Technical Architecture

### System Overview

The Internovel Platform is built on a microservices architecture, leveraging cloud-native technologies to ensure scalability, reliability, and performance. The core components include:

- **Frontend & Backend**: A web-based interface and server-side logic built with a unified framework.
- **Database**: Manages structured and unstructured data.
- **Decentralized Identity Layer**: Manages user identities and attribution.

### Component Structure

1. **Frontend & Backend**: Built with Nuxt.js 3 (Vue.js-based), providing a responsive and intuitive user interface and handling server-side logic and API endpoints. The frontend leverages the Vuetify UI framework for componentry and styling. Refer to [Vuetifying.md](Vuetifying.md) for detailed architecture decisions regarding Vuetify.
2. **Database**: Utilizes Supabase (PostgreSQL) for storing user data, novel metadata, collaboration states, character bios, and feature-specific data.
3. **Decentralized Identity Layer**: Manages decentralized identity using W3C Decentralized Identifiers (DIDs) and cryptographic operations.

### Authentication Architecture

The platform uses a combination of traditional authentication methods and decentralized identity solutions. Key components include:

- **OAuth 2.0**: Used for traditional authentication and authorization, specifically for connecting to a variety of external third-party services to enable document storage integration and leveraging external resources.
- **Decentralized Identifiers (DIDs)**: For managing core user identities and ensuring immutable attribution of contributions, anchored to `did:key` for MVP1.
- **JWT Tokens**: For secure communication between frontend and backend services.
- **Web Crypto API**: Used for in-browser key generation and cryptographic operations for DID management.
- **IndexedDB**: Used for secure storage of encrypted private keys in the browser.
- **Challenge-Response Mechanism**: For DID-based authentication.

### Database Architecture

The platform employs a PostgreSQL database managed by Supabase.

- **PostgreSQL (Supabase)**: For storing structured data such as user profiles, content metadata, Novel Spine structures, Vertebrae content, section, theme, and topic definitions and associations, collaboration states, character bios, "Travel trunk" information, and Casting Studio/Novel Café data.
- **Drizzle ORM**: Used for type-safe schema definition, migrations, and database interactions.

### API Structure

The platform's API is built using Nuxt.js 3 server-side capabilities, providing a clear and consistent interface for frontend-backend communication. Key endpoints will be defined as part of the Nuxt.js server routes.

## Implementation Strategy (MVP1 Focus)

The initial development of the Internovel Platform focuses on delivering a Minimum Viable Product (MVP1) with core functionalities and a user-friendly experience, as outlined in the "Key Features (MVP1)" section.

## Future Vision (Post-MVP1)

While MVP1 establishes a strong, user-friendly foundation, InterNovel's long-term vision embraces greater decentralization and expanded features, including:

- Enhanced DID Management: Integration with W3C WebAuthn and support for external DID wallets.
- Decentralized Storage Options: Introduction of opt-in decentralized storage solutions like OrbitDB.
- Advanced Collaborative Tools: More sophisticated version control, branching narratives, full co-editing features, and advanced analytics.
- Expanded Community & Discovery: Enhancing the Casting Studio and Novel Café with advanced filtering, recommendation algorithms, features for forming writing groups, and hosting collaborative events.
- Monetization & Licensing: Exploration of DID-based licensing frameworks and potential monetization paths for authors.

## Decentralized Identity and Attribution (MVP1)

For MVP1, decentralized identity is managed using `did:key` and in-browser key management via the Web Crypto API and IndexedDB. All creative contributions are cryptographically linked to the author's DID for immutable attribution.

## Intellectual Property Management (MVP1 Foundation)

MVP1 lays the foundation for future IP management by ensuring clear and verifiable attribution through DID-based signing of contributions. A full DID-based licensing framework is part of the future vision.

## User Experience Design

The user experience design of the Internovel Platform focuses on providing an intuitive and seamless experience for both authors and readers. Key design principles include:

- **User-Centered Design**: Prioritizes the needs and preferences of users in the design process.
- **Responsive Design**: Ensures that the platform is accessible on a variety of devices, including desktops, tablets, and smartphones.
- **Accessibility**: Adheres to accessibility standards to ensure that the platform is usable by individuals with disabilities.

## Roadmap and Development Status

The development roadmap outlines the key milestones and deliverables for the Internovel Platform. Current status and upcoming milestones include:

- **Current Status**: Phase 1 development is underway, with core functionality being implemented and tested.
- **Upcoming Milestones**: Completion of Phase 1, followed by the initiation of Phase 2 development.

## Development Notes

- **Version Control**: The project uses Git for version control, with a branching strategy to manage feature development and releases.
- **Continuous Integration/Continuous Deployment (CI/CD)**: Automated pipelines are set up to ensure efficient and reliable deployment of new features and updates.
- **Testing**: Comprehensive testing is conducted at each stage of development, including unit tests, integration tests, and user acceptance tests.
