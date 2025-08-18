# Internovel Platform

## Project Status

**Note on Project Status:** All documentation in this repository is actively maintained and updated alongside code changes. The documentation represents the current state of the project and should be considered authoritative.

Internovel is a decentralized collaborative writing ecosystem designed to revolutionize how authors create, share, and maintain ownership of their creative work. It combines traditional collaborative features with cutting-edge decentralized identity technology to enable multiple authors to work together while maintaining clear attribution and intellectual property rights for their contributions.

## Project Vision

To empower authors with a platform that fosters collaborative creativity, ensures immutable attribution, and provides robust intellectual property management in a decentralized environment.

## Core Value Propositions

*   **Decentralized Identity Management**: Authors maintain control over their identities and contributions through DID-based identity.
*   **Collaborative Writing Tools**: Real-time collaboration, version control, and content management within an intuitive writing environment.
*   **Intellectual Property Protection**: DID-based attribution and a future licensing framework secure and verify ownership.
*   **Community Engagement**: Features like the "Casting Studio" and "Novel Café" foster a vibrant creative community.
*   **Character Portability**: Characters can exist and evolve across different stories via the "Character Travel Trunk."

## Key Features (MVP1)

Internovel's Minimum Viable Product (MVP1) focuses on:

*   **Decentralized Identity**: Users generate and manage W3C Decentralized Identifiers (DIDs) using `did:key`, with secure in-browser key management. All creative contributions are cryptographically linked to the author's DID for immutable attribution.
*   **"Character Travel Trunk"**: A system for authors to propose their original characters for inclusion in other stories, including narrative samples and character bios.
*   **"Novel Spine"**: A flexible story structuring tool allowing authors to build a non-linear narrative using "Vertebrae" (ideas, plot points, themes) that can be time-stamped and tagged for organization and dynamic arrangement.
*   **Intuitive Collaborative Writing Environment**: Built with Nuxt.js 3, Pinia, and Vuetify, offering real-time collaboration, simplified version tracking, and granular permissions.
*   **"Casting Studio"**: A discovery hub for authors to showcase their characters and find others' characters for integration.
*   **"Novel Café"**: A space for authors to feature their novels and seek collaborators.
*   **Flexible Document Management**: Integration with third-party services (e.g., GitHub, Google Docs) for storing novel text files.
*   **Authorization and Moderation**: Tiered authorization and a moderation process for student accounts.

## Technology Stack

*   **Frontend**: Nuxt.js (Vue.js 3), Vuetify 3
*  - **Backend**: Nuxt.js 3 server-side capabilities
*   **Database**: Supabase (PostgreSQL) with Drizzle ORM, and OrbitDB. Internovel employs Supabase and OrbitDB in tandem, ensuring that content can always be hosted with or without Supabase. Decentralized IDs will be used in both databases and both databases will be updated simultaneously. Write operations go first to the local Helia OrbitDB which then triggers the action on Supabase. Read operations attempt Supabase first due to probable lower latency but gracefully fall back to OrbitDB if Supabase isn't available. Eventually, if Supabase doesn't respond, OrbitDB will get the data anyway via its own networking, communications, and replication activities.
*   **Authentication**: Custom DID-based authentication, OAuth 2.0, JWT Tokens, Web Crypto API, IndexedDB
*   **Version Control**: Git/GitHub for collaborative writing and document management

## Deployment

*   **Hosting**: Vercel (for frontend), Supabase (for backend and database)
*   **CI/CD**: GitHub Actions for automated testing and deployment



## License

[License Information - to be added]