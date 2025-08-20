# Internovel Development Tasks

## Phase 1: UI Framework Unification (Completed)

- [x] Replace Tailwind CSS with Vuetify.
- [x] Consolidate Vuetify theme configuration.
- [x] Update all relevant documentation.

## Phase 2: DID Implementation

- [ ] **DID Implementation**
  - [ ] **Data Model:**
    - [ ] Implement `did:peer` for DIDs.
    - [ ] Define and implement custom DID document fields for user profiles (`displayName`, `avatarUrl`, `profileUrl`).
  - [ ] **Cryptographic Functions:**
    - [ ] Use the Node.js `crypto` module for cryptographic operations.
    - [ ] Implement support for both Ed25519 and Secp256k1 cryptographic suites.
    - [ ] Implement key generation, storage, and management.
  - [ ] **Storage:**
    - [ ] Set up OrbitDB with Helia IPFS for decentralized data storage.
    - [ ] Configure file-based persistence for OrbitDB and Helia on the VPS.
    - [ ] Set up a local PostgreSQL instance as a read-optimized cache.
    - [ ] Implement event-driven synchronization from OrbitDB to PostgreSQL.
  - [ ] **DID Store:**
    - [ ] Create a Pinia store (`stores/did.ts`) to manage DIDs and user profiles.
    - [ ] Implement actions to create, read, update, and deactivate DIDs.
    - [ ] Integrate the DID store with the OrbitDB and PostgreSQL storage layers.
- [ ] **Character Management**
- [ ] Implement core features as outlined in the project documentation.

## Phase 4: Testing and Deployment

- [ ] Implement a comprehensive testing suite.
- [ ] Prepare for deployment.