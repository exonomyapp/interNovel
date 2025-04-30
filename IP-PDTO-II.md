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

## Core Value Propositions

1. **Decentralized Identity Integration**: Authors maintain control of their identity and work through W3C DID standards.
2. **Clear Attribution**: Every paragraph is permanently linked to its author's DID.
3. **Flexible Collaboration**: Multiple permission levels and collaboration models.
4. **IP Protection**: Built-in mechanisms for tracking ownership and attribution.
5. **Future-Proof Architecture**: Modular design that will evolve toward fully decentralized operation.

## Technical Architecture

### System Overview

The platform uses a modular architecture built with modern web technologies:

- **Language**: TypeScript with strong typing and extensive annotations. Other languages may be used where more effective.
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
   - DID accounts "contain" multiple third-party authenticator accounts as resources.

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

## Multi-Phase Implementation Strategy

The platform is being developed in distinct phases:

1. **Foundation (Current)**: PostgreSQL-based persistence with DID authentication.
2. **Collaboration Enhancement**: Permission systems and real-time collaborative features.
3. **Decentralization**: Integration of OrbitDB/IPFS for distributed content storage.
4. **Narrative Intelligence**: To be determined.

## Intellectual Property Management

### Attribution Tracking

Every creative contribution in the platform is permanently linked to:
- The author's specific DID used at creation time.
- Timestamp and metadata about creation context.

### Collaboration Permissions

The platform supports multiple collaboration models:

- **Solo**: Single author with complete control.
- **Mentor/Student**: Lead author with supervised contributors.
- **Equal Partners**: Shared ownership with defined roles and/or scopes.
- **Open Contribution**: Moderated public contribution with attribution.

### IP Export and Verification

Authors can:
- Export works with complete attribution data.
- Generate verification certificates for off-platform usage.
- Eventually integrate with external copyright registration systems.

## User Experience Design

### User Interface Philosophy

The platform emphasizes:
- Progressive disclosure of complexity.
- Context-sensitive help and tooltips.
- Consistent visual language.
- Responsive design for all devices.

### Key Interaction Patterns

1. **NavBar DID Management**: Left-side dropdown for DID selection and management.
   - Admin DIDs marked with a star icon for easy identification.
   - Option to import existing DIDs via seed phrase.

2. **Auth Provider Controls**: Right-side dropdown with auth provider management.
   - Visual green/red ball light indicator showing if signed in or not.
   - One-click toggle switches for enabling/disabling each provider.

3. **Collaborative Editing**: Real-time paragraph-level editing with attribution.
   - Each paragraph tracked with author's DID and timestamp.
   - Inline commenting and feedback system for collaborative review.

4. **Relationship Visualization**: Interactive network graphs of narrative elements.
   - Visual mapping of character relationships and theme connections.

## Roadmap and Development Status

### Phase 1: Foundation
- ✓ User authentication with DID integration.
- ✓ PostgreSQL schema implementation.
- ✓ Core API endpoint development.

### Phase 2: Collaboration Features
- Novel creation and management interfaces.
- Section and paragraph editing workflows.

### Phase 3: Decentralized Storage
- OrbitDB/IPFS integration.
- Offline editing capabilities.

### Phase 4: Advanced Features
- AI-assisted writing tools.
- Narrative analytics.

## Development Notes

### Technical Decisions
- JSON columns for flexible DID and auth provider storage.
- Comprehensive error handling for all API endpoints.

### Security Considerations
- All passwords hashed using bcrypt.
- DID authentication using cryptographic signatures.
- Role-based access control for all collaborative features.

---

*This document reflects the updated structure and recommendations.*