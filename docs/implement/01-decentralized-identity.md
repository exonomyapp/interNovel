### Feature Category: Decentralized Identity

#### **Feature:** Implement DID Generation and Management

*   **Context:** This involves implementing the core functionality for users to generate and manage their Decentralized Identifiers (DIDs) within the Internovel platform. This is fundamental for enabling immutable attribution of creative contributions.
*   **Requirements:**
    *   [ ] Users must be able to generate a `did:peer` upon account creation or in their profile settings. The `did:peer` method is selected for its ability to support DID document updates, which is crucial for evolving user profiles and service endpoints without relying on a blockchain.
    *   [ ] The platform must securely store the encrypted private keys in the user's browser using IndexedDB.
    *   [ ] User-uploaded assets, such as avatars and profile documents, will be stored on Helia IPFS to ensure decentralized, content-addressed storage.
    *   [ ] Provide a user interface for managing their DID, including viewing the public DID.
    *   [ ] Ensure the implementation adheres to W3C DID specifications for the `did:peer` method.
    *   [ ] Define and implement custom DID document fields for user profiles (`displayName`, `avatarUrl`, `profileUrl`).
*   **Technical Approach:**
    *   Use the Node.js `crypto` module for cryptographic operations, implementing support for both Ed25519 and Secp256k1 cryptographic suites.
    *   Set up OrbitDB with Helia IPFS for decentralized data storage, with file-based persistence on the server.
    *   Configure Drizzle ORM to connect to the existing server-side PostgreSQL instance. This instance will house a new database for Internovel, serving as a read-optimized cache with event-driven synchronization from OrbitDB.
    *   Create a Pinia store (`stores/did.ts`) to manage DIDs and user profiles, integrating with both OrbitDB and PostgreSQL.
*   **Acceptance Criteria:**
    *   [ ] A new user can successfully generate a DID.
    *   [ ] The generated DID is a valid `did:peer`.
    *   [ ] The encrypted private key is securely stored in IndexedDB.
    *   [ ] The user can view their public DID in the application.
*   [ ] **Notes/Considerations:** Consider the user experience for key backup and recovery. Address potential security vulnerabilities related to key management in the browser.

#### **Feature:** Implement DID-Based Authentication

*   **Context:** This focuses on implementing the challenge-response authentication mechanism using the user's DID. This provides a decentralized method for user authentication.
*   **Requirements:**
    *   [x] The backend must generate a unique challenge for the user during the login process.
    *   [x] The frontend must use the user's private key to sign the challenge.
    *   [x] The backend must verify the signature using the user's public DID.

*   **Technical Approach:** 
    *   Backend endpoints for issuing challenges and verifying signatures.
    *   Frontend logic using the Node.js `crypto` module for signing.
    *   Integration with JWT token issuance.
    *   Implemented in `useDidAuth.ts` composable with:
        *   `createChallenge()` - Generates random challenge
        *   `signChallenge()` - Signs with private key from `useDid`
        *   `verifySignature()` - Verifies using public key
*   **Acceptance Criteria:**
    *   [x] A user can successfully log in using their DID.
    *   [x] The authentication process utilizes a challenge-response mechanism.
    *   [x] Challenges are single-use and time-limited

*   [x] **Implementation Complete:**
    *   Added challenge-response flow in `useDidAuth.ts`
    *   Integrated with existing auth system
    *   Added security measures against replay attacks

#### **Feature:** Implement Cryptographic Linking of Contributions to DID

*   **Context:** This is crucial for ensuring immutable attribution of creative contributions by cryptographically linking them to the author's DID. This is fundamental for enabling immutable attribution of creative contributions.
*   **Requirements:**
    *   [ ] When a user makes a contribution (e.g., adding a paragraph, defining a character element), the contribution data must be signed by the user's private key.
    *   [ ] The signature and the user's DID must be stored alongside the contribution data in OrbitDB.
    *   [ ] The platform must be able to verify the signature using the author's public DID to confirm the contribution's authenticity and origin.
*   **Technical Approach:** Modify the data models to include fields for DID and signature. Implement backend logic to handle the signing process before saving contributions and verification when retrieving or displaying contributions. Develop frontend components to facilitate the signing process (potentially transparent to the user).
*   **Acceptance Criteria:**
    *   [ ] Every creative contribution is associated with the author's DID and a valid cryptographic signature.
    *   [ ] The platform can verify the signature of a contribution using the author's public DID.
    *   [ ] Attribution information (linked to the DID) is displayed for each contribution.
*   [ ] **Notes/Considerations:** Determine the granularity of contributions to be signed (e.g., per paragraph, per section). Consider the performance implications of signing and verifying contributions.