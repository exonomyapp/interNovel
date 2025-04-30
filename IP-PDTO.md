# Internovel Platform: Project Documentation and Technical Overview (Enhanced)

## Project Vision and Purpose

The Internovel Platform is a decentralized collaborative writing ecosystem designed to revolutionize how authors create, share, and maintain ownership of their creative work. By combining traditional collaborative features with decentralized identity technology, the platform enables multiple authors to work together while maintaining clear attribution and intellectual property rights for their contributions.

## Core Value Propositions

1. **Decentralized Identity Integration**: Authors maintain control of their identity and work through W3C DID standards
2. **Clear Attribution**: Every paragraph is permanently linked to its author's DID
3. **Flexible Collaboration**: Multiple permission levels and collaboration models
4. **IP Protection**: Built-in mechanisms for tracking ownership and attribution
5. **Future-Proof Architecture**: Modular design that will evolve toward fully decentralized operation

## Technical Architecture

### System Overview

The platform uses a modular architecture built with modern web technologies:

- **Language**: TypeScript with strong typing and extensive annotations that reflect strongly intentional type ingenuity. Wherever prudent, another language can be used to produce solutions more effectively than TypeScript, if the situation presents itself.
- **Frontend**: Nuxt.js 3 (Vue.js-based) with component-scoped CSS
- **State Management**: Pinia stores with composables for business logic and importable technology built to integrate Pinia into a Nuxt project.
- **Authentication**: Two-dimensional system with W3C DIDs as a mandatory primary and third-party providers as an optional secondary.
- **Current Storage**: PostgreSQL via Supabase
- **Future Storage**: Hybrid model with OrbitDB/IPFS integration to migrate from federated island communities to entirely decentralized P2P and offline capabilities

### Component Structure

The application follows Nuxt.js conventions for organization:

- **/pages**: Route-based Vue components following Nuxt file-based routing
- **/components**: Reusable Vue components with scoped styling
- **/composables**: Shared logic using Vue 3 Composition API
- **/stores**: Pinia state management stores for global state
- **/server**: Server-side logic including API endpoints and middleware
- **/shared**: Cross-environment code like database schema definitions

### Authentication Architecture

The platform implements a layered authentication approach:

1. **DID Layer (Primary, mandatory)**
   - W3C DID standard for decentralized identity
   - Client-side key generation and cryptographic operations
   - Challenge-response verification pattern
   - Multiple DIDs per user with primary designation

2. **Provider Layer (Secondary, optional)**
   - OAuth integration with third-party providers
   - Toggle-based session management
   - Third-party provider feature (dropdown button UI control for multi-provider management) visible only for authenticated DID.
   - DID accounts "contain" multiple third-party authenticator accounts as resources, fully managed in a section of the DID account's settings.

### Database Architecture

A clean, modular database design with:

- **Schema Definition**: Type-safe Drizzle ORM models with TypeScript
- **Storage Abstraction**: Interface-based design for future storage flexibility
- **Relationship Mapping**: Explicit entity relationships for type-safe queries
- **JSON Storage**: Strategic use of JSON columns for flexible data structures

### API Structure

The API follows RESTful design patterns with clean separation:

- **Authentication**: Endpoints for DID verification, login, signup
- **Content Management**: Novel, section, and paragraph CRUD operations
- **Collaboration**: Permissions and multi-user coordination
- **Metadata**: Character, theme, and topic management / integration into novels.

All API endpoints implement proper validation, error handling, and type safety.

### Multi-Phase Implementation Strategy

The platform is being developed in distinct phases:

1. **Foundation (Current)**: PostgreSQL-based persistence with DID authentication
2. **Collaboration Enhancement**: Permission systems and real-time collaborative features
3. **Decentralization**: Integration of OrbitDB/IPFS for distributed content storage
4. **Narrative Intelligence**: To be determined

### Authentication and Identity Management

The platform implements a two-dimensional authentication system:

- **Primary Dimension**: W3C DIDs with cryptographic proof of ownership
  - Each W3C DID is a sovereign digital identity with cryptographic verification
  - DIDs are persistent and globally unique identifiers
  - DIDs are stored in PostgreSQL now, but will be relocated to OrbitDB in future phases
  - DIDs serve as the foundational layer of identity in the platform
  - Peer Admin DIDs, alone, are empowered to a) accept invitations to collaborate and b) to publish publicly, to anyone.
  - Non-Admin DIDs can still sign and attribute their own creative contributions to themselves but can publish only socially, to their own followers.

- **Secondary Dimension**: Third-party authentication providers
  - Traditional auth providers (Google, GitHub, Twitter, Facebook, etc.)
  - These providers offer Internovel users easy access to the services their platforms provide.
  - The Secondary auth providers management control is only visible when the DID is signed in 
  - Each provider can be toggled on/off with one-click session management

#### Authentication Process Flow
1. User creates or imports a W3C DID as a primary identity for signing in to the platform
2. DID is verified through cryptographic proof of ownership
3. Once verified and signed in, third-party auth provider management becomes available in the top navbar above the dashboard
4. Signed in DID users can add multiple providers to their DID account
5. All providers link back to their own primary DID in the interNovel multi-DID platform, efficiently consolidating sovereignty across the social media spectrum to a single autonomously decentralized identity

#### Technical Implementation Details
- DID Creation: Using key-did-provider-ed25519 for cryptographic security
- DID Storage: Private keys never leave the client; only public DIDs stored on server
- DID Verification: Challenge-response pattern using did-jwt for signatures
- Auth Provider Management: OAuth2 flows for major providers
- Session Management: JWT tokens with DID signatures for authentication

interNovel supports:
- Multiple DID authentication per device for purely creative personas
- Follow after - and be followed by - other DIDs
- Easily switch between DIDs for different projects
- Add third-party authenticated services for convenience and enhanced features
- Toggle individual auth providers with a single click
- End specific sessions without logging out completely

## Database Schema

### Core Entities

The PostgreSQL schema uses Drizzle ORM with the following key entities:

#### Users

#### Novels

#### Sections

#### Paragraphs

#### Characters

#### Themes

#### Relationships

#### Sessions

### Entity Relationships

### Advanced Relationship Management

The platform provides comprehensive tracking of narrative elements:

- Character-to-character relationships through the relationship table
- Theme-to-character connections with bidirectional references
- Paragraph-to-theme attributions for thematic analysis
- Historical tracking of relationship development through timestamps
- Attribution of all content to specific DIDs for IP tracking

The schema design enables complex queries such as:
- Finding all paragraphs written by a specific DID across all novels
- Tracking character development across novels
- Analyzing thematic evolution throughout a collaborative work
- Identifying contribution patterns across multiple authors

## Intellectual Property Management

### Attribution Tracking

Every creative contribution in the platform is permanently linked to:
- The author's specific DID used at creation time
- Timestamp and metadata about creation context

### Collaboration Permissions

The platform supports multiple collaboration models:

- **Solo**: Single author with complete control
- **Mentor/Student**: Lead author with supervised contributors
- **Equal Partners**: Shared ownership with defined roles and / or scopes
- **Open Contribution**: Moderated public contribution with attribution

### IP Export and Verification

Authors can:
- Export works with complete attribution data
- Generate verification certificates for off-platform usage
- Eventually integrate with external copyright registration systems

## User Experience Design

### User Interface Philosophy

The platform emphasizes:
- Progressive disclosure of complexity
- Context-sensitive help and tooltips
- Consistent visual language
- Responsive design for all devices

### Key Interaction Patterns

1. **NavBar DID Management**: Left-side dropdown for DID selection and management
   - Located in the top left corner of the navigation bar
   - Expands dropdown panel to the right to prevent UI overflow
   - Admin DIDs marked with a star icon for easy identification
   - Ability to create new DIDs directly from the dropdown
   - Option to import existing DIDs via seed phrase
   - Clear visual indicators for active vs. inactive DIDs

2. **Auth Provider Controls**: Right-side dropdown with auth provider management
   - Located in the top right corner of the navigation bar
   - Expands dropdown panel to the left to prevent UI overflow
   - Visual green/red ball light indicator showing if signed in or not
   - One-click toggle switches for enabling/disabling each provider
   - Session management interface with ability to end individual sessions
   - "Connect New Provider" button to easily add authentication methods

3. **Two-Dimensional Authentication Flow**:
   - First dimension: Select and verify a W3C DID (primary identity)
   - Second dimension: Only after DID verification, manage auth providers
   - Clear visual guidance through verification process
   - Proper error handling and user feedback during authentication
   - Secure session management with cryptographic verification

4. **Collaborative Editing**: Real-time paragraph-level editing with attribution
   - Investigate open source pluggable solutions for embeddable editors that provide collaborative DID-oriented decentralized editing
   - Each paragraph tracked with author's DID and timestamp
   - Visual indicators for content ownership and contribution status
   - Permission-based editing controls based on collaboration model
   - Inline commenting and feedback system for collaborative review

5. **Relationship Visualization**: Interactive network graphs of narrative elements
   - Visual mapping of character relationships and theme connections
   - Timeline-based tracking of relationship development
   - Filtering and visualization tools for narrative analysis
   - Export options for relationship data and documentation

## Database Implementation

### PostgreSQL Integration

The platform uses PostgreSQL with Drizzle ORM for type-safe database access:

### Data Access Layer

A storage interface isolates database access from the rest of the application, enabling future substitution with alternative storage backends:


### Schema Migration Pattern

The platform uses a simple migration approach with Drizzle ORM's push capability:

1. Schema changes are made to the `shared/schema.ts` file
2. The `db-migrate.js` script uses Drizzle's push feature to synchronize the database schema
3. A CI/CD pipeline will eventually handle migration validation and deployment

## Roadmap and Development Status

### Phase 1: Foundation
- ✓ User authentication with DID integration
  - ✓ W3C DIDs using key-did-provider-ed25519
  - ✓ Cryptographic verification of DID ownership
  - ✓ DID storage and management in user profiles
  - ✓ Challenge-response verification pattern
- ✓ PostgreSQL schema implementation
  - ✓ Fully defined entity schema with relations
  - ✓ Type-safe Drizzle ORM integration
  - ✓ Storage abstraction layer for modularized future backend flexibility
- ✓ Core API endpoint development
  - ✓ Authentication APIs (login, signup, logout)
  - ✓ DID management APIs
  - ✓ User profile management
- ✓ Two-dimensional authentication UI
  - ✓ DID selection and management dropdown (primary mandatory dimension)
  - ✓ Auth provider management dropdown (secondary dependent optional dimension)
  - ✓ Event-based communication between components

### Phase 2: Collaboration Features
- Novel creation and management interfaces
- Section and paragraph editing workflows
- Character, theme, and topic management
- Collaborative permission system implementation
- Real-time collaboration features

### Phase 3: Decentralized Storage
- OrbitDB/IPFS integration
- Offline editing capabilities
- Synchronization protocols

### Phase 4: Advanced Features
- AI-assisted writing tools
- Narrative analytics
- Publication workflows
- Community features

## Development Notes

### Technical Decisions
- JSON columns for flexible DID and auth provider storage
- Comprehensive error handling for all API endpoints
- Follow Nuxt.js conventions for route and component organization

### UI Implementation Details

#### Two-Dimensional Authentication System

- **Component Communication**:
  - Custom event dispatching system for cross-component communication
  - Centralized authentication state management in Pinia stores
  - Decoupled components with clean interfaces

### Security Considerations
- All passwords hashed using bcrypt
- DID authentication using cryptographic signatures
- Role-based access control for all collaborative features
- Regular security audits planned

---

*This document will be updated as the project evolves.*