# Internovel Platform: Project Documentation and Technical Overview

## Project Vision and Purpose

The Internovel Platform is a decentralized collaborative writing ecosystem designed to revolutionize how authors create, share, and maintain ownership of their creative work. By combining traditional collaborative features with decentralized identity technology, the platform enables multiple authors to work together while maintaining clear attribution and intellectual property rights for their contributions.

## Core Value Propositions

1. **Decentralized Identity IntegratiInternovel
Internovel is a collaborative writing platform designed to revolutionize the way authors create, share, and maintain ownership of their creative work.

Imagine a space where writers can seamlessly collaborate on novels, scripts, and other creative projects, all while retaining clear attribution and intellectual property rights. Internovel provides a suite of tools for real-time collaboration, version control, and content management, fostering a vibrant community of authors and readers.

Just as GitHub revolutionized collaborative coding, Internovel aims to do the same for collaborative creative writing. By leveraging GitHub as its backend, Internovel extends the repository for managing the content of every novel. GitHub issues function as writing tasks, leveraging all of GitHub's features for delegating writing tasks to collaborators.

Internovel offers authors a unique set of capabilities:

Character Universe Management: Internovel facilitates collections of characters, themes, and topics for every author, outside of GitHub and within a Supabase instance. These collections can conveniently traverse novels and authors, creating a shared universe of creative elements.
Social Media-Inspired Collaboration: Inspired by social media dynamics, Internovel allows authors to create characters that they might like to introduce to other authors. These characters aren't brand new creations but have appearances in other novels, even novels that belong to other authors, bringing characters to life by allowing them to "literally" jump off the pages of the story they're in and make various kinds of appearances and play various roles throughout the Internovel network, just like a film star who pops up in many films, some of which are sequels, and in others there's only a cameo. It's all up to the authors.
AI-Powered Plot Recommendations: Internovel's AI features load the character's context by retrieving content of appearances in parts of other stories that might be relevant to a new project and then recommends plot options for character injection into other projects.
Join us in building the future of collaborative writing!on**: Authors maintain control of their identity and work through W3C DID standards.
2. **Clear Attribution**: Every paragraph is permanently linked to its author's DID.
3. **Flexible Collaboration**: Multiple permission levels and collaboration models.
4. **IP Protection**: Built-in mechanisms for tracking ownership and attribution.
5. **Future-Proof Architecture**: Modular design that will evolve toward fully decentralized operation.

## Technical Architecture

### System Overview

The platform uses a modular architecture built with modern web technologies:

- **Language**: TypeScript with strong typing and extensive annotations.
- **Frontend**: Nuxt.js 3 (Vue.js-based) with component-scoped CSS.
- **State Management**: Pinia stores with composables for business logic.
- **Authentication**: Two-dimensional system with W3C DIDs as a mandatory primary and third-party providers as an optional secondary.
- **Current Storage**: PostgreSQL via Supabase.
- **Future Storage**: Hybrid model with OrbitDB/IPFS integration for decentralized P2P and offline capabilities.

### Component Structure

The application follows Nuxt.js conventions for organization:

- **/pages**: Route-based Vue components following Nuxt file-based routing.
- **/components**: Reusable Vue components with scoped styling.
- **/composables**: Shared logic using Vue 3 Composition API.
- **/stores**: Pinia state management stores for global state.
- **/server**: Server-side logic including API endpoints and middleware.
- **/shared**: Cross-environment code like database schema definitions.

### Authentication Architecture

The platform implements a layered authentication approach:

1. **DID Layer (Primary, mandatory)**
   - W3C DID standard for decentralized identity.
   - Client-side key generation and cryptographic operations.
   - Challenge-response verification pattern.
   - Multiple DIDs per user with primary designation.

2. **Provider Layer (Secondary, optional)**
   - OAuth integration with third-party providers.
   - Toggle-based session management.
   - Third-party provider feature visible only for authenticated DID.

### Database Architecture

A clean, modular database design with:

- **Schema Definition**: Type-safe Drizzle ORM models with TypeScript.
- **Storage Abstraction**: Interface-based design for future storage flexibility.
- **Relationship Mapping**: Explicit entity relationships for type-safe queries.
- **JSON Storage**: Strategic use of JSON columns for flexible data structures.

### API Structure

The API follows RESTful design patterns with clean separation:

- **Authentication**: Endpoints for DID verification, login, signup.
- **Content Management**: Novel, section, and paragraph CRUD operations.
- **Collaboration**: Permissions and multi-user coordination.
- **Metadata**: Character, theme, and topic management.