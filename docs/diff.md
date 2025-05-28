# Functional Differences: `main` vs. `karthik` Branch (Issueman Features)

This document outlines the key functional differences in "Issueman" related features between the `main` branch and the `karthik` branch, based on code analysis of their respective diffs.

## 1. Authentication & GitHub User Integration

**Main Branch (Presumed State):**
- Likely utilized a simpler authentication mechanism, possibly a Personal Access Token (PAT) configured on the backend, or had mock user integration for development.
- API calls for GitHub data were generally proxied through local backend endpoints (e.g., `/api?type=issues`).

**Karthik Branch Changes:**
- **Implemented Full GitHub OAuth 2.0 Flow:**
    - Introduces new server-side API endpoints:
        - `server/api/auth/login.ts`: Initiates the OAuth flow by redirecting to GitHub.
        - `server/api/auth/github-callback.ts`: Handles the callback from GitHub after user authorization, exchanges the received code for an access token.
        - `server/api/auth/[...].ts`: A more comprehensive endpoint likely consolidating various auth actions like providing the token to the client and handling logout. It uses HTTP-only cookies to store the access token.
    - A new `server/middleware/auth.ts` redirects `/auth/callback` requests to `/api/auth/callback`.
    - Client-side authentication state and logic are managed by a new composable: `composables/useAuth.ts`. This composable handles login initiation, logout, and fetching/storing user information (avatar, username) after successful authentication by calling the GitHub API directly with the token.
- **Direct GitHub API Interaction via `useGithub.ts`:**
    - A new `composables/useGithub.ts` is introduced. It initializes an Octokit instance using the access token obtained via `useAuth.ts`.
    - This composable is now responsible for fetching user-specific GitHub data like repositories and user details (avatar, name).
- **Revamped `components/Users.vue`:**
    - This component is significantly changed to integrate with the new OAuth system.
    - It displays the user's GitHub avatar and a "Logout" button when authenticated.
    - It initiates the login process (which redirects to the GitHub OAuth screen).
    - It now also lists the authenticated user's repositories, fetched using `useGithub.ts`.
- **Integration in `pages/index.vue`:**
    - The main page now integrates with this new authentication system, managing an `isAuthenticated` state and handling token storage/retrieval from localStorage (in addition to the server-side cookie).

**Functional Difference Summary:**
The `karthik` branch implements a complete and robust GitHub OAuth 2.0 authentication system. This allows the application to securely authenticate users and make API calls to GitHub on their behalf, providing a true user-centric experience. This replaces what was likely a more basic or placeholder authentication system in the `main` branch.

## 2. Repository Selection & Contextual Data Fetching

**Main Branch:**
- Issue-related operations likely targeted a default or globally configured repository.
- `components/TreeNav.vue` fetched issues from a generic local API endpoint (`/api?type=issues`) without an explicit repository prop.

**Karthik Branch Changes:**
- **Repository Selection UI:**
    - `pages/index.vue` now incorporates a `components/RepositoryList.vue` (a new or modified component, based on the file list) allowing users to select a GitHub repository.
    - A `selectedRepository` state is maintained in `pages/index.vue`.
- **Contextual Operations:**
    - `components/TreeNav.vue` now accepts a `repository` prop (e.g., `owner/repo_name`). It fetches issues directly from the GitHub API for this selected repository (`https://api.github.com/repos/${props.repository}/issues?state=all`) using the authenticated user's token.
    - Comment fetching in `pages/index.vue` is also updated to use the `selectedRepository.value.full_name` and the user's token to target the GitHub API directly.

**Functional Difference Summary:**
Users in the `karthik` branch can now select a specific GitHub repository to work with. All subsequent issue and comment data fetching and interactions are scoped to this selected repository and performed directly against the GitHub API, authenticated as the user. This makes the tool significantly more versatile and directly integrated with GitHub's data structure.

## 3. Issue Tree Navigation (`components/TreeNav.vue`)

**Main Branch:**
- Fetched issue data from a local backend endpoint.
- Styling was likely based on standard Vuetify components.

**Karthik Branch Changes:**
- **Direct Data Fetching from GitHub:** As noted above, it now fetches issues directly from the GitHub API for the selected repository, using the authenticated user's token.
- **UI/Styling Overhaul:**
    - The component has undergone a significant visual redesign, adopting a GitHub-like theme. This is evident from new CSS classes (e.g., `tree-nav gh-box`, `gh-header`, `gh-title`, `gh-list-item`, `gh-tag`) and the use of CSS variables for theming (e.g., `var(--gh-closed-emphasis)`).
    - Improved UI for loading states, error messages (e.g., "Select a repository to view issues"), and "No issues found" messages, with new alert styling.
- **Props & Logic:**
    - Accepts a `repository` prop.
    - Watches for changes in the `repository` prop to re-fetch issues or clear the list.
    - Authentication check before fetching: `if (!token) { throw new Error('Authentication required'); }`.

**Functional Difference Summary:**
`TreeNav.vue` in the `karthik` branch is tightly integrated with the new authentication and repository selection system. It fetches data directly and dynamically from GitHub and features a substantially updated user interface with a distinct visual style.

## 4. Issue and Comment Management (`pages/index.vue`)

**Main Branch:**
- Likely relied on local backend API endpoints (e.g., `/api?type=comments`) for fetching and submitting comments.

**Karthik Branch Changes:**
- **Direct GitHub API for Comments:** Comment fetching and submission now directly target the GitHub API (e.g., `https://api.github.com/repos/${selectedRepository.value.full_name}/issues/${issueNumber}/comments`) using the authenticated user's token.
- **Layout Restructuring:** `pages/index.vue` is reorganized into a two-column layout:
    - `left-column`: Contains `RepositoryList` and `TreeNav`.
    - `right-column`: Contains `IssueDetail`, `CommentsSection`, and `LogViewer`.
- **Styling:** Panels now use a common `gh-box` styling.
- **Authentication Dependency:** Comment operations are conditional on `githubAccessToken.value` being present.

**Functional Difference Summary:**
Core interactions for viewing and adding comments are now performed directly against the GitHub API, authenticated as the user. The main page layout is significantly restructured for better organization of these components.

## 5. Parent-Child Relationship Management (Backend Logic)

- The primary backend logic for parsing issue descriptions to establish parent-child relationships (located in `server/api/index.ts`, specifically the `processChildReferences` function) **was not present in the list of changed files** between `main` and `karthik`.
- **Functional Implication:** This strongly suggests that the *method* by which parent-child relationships are detected from issue text (e.g., inline references, "### Children:" section) and how the `parentId` field is set on child issues **remains consistent** between the two branches.
- The changes in the `karthik` branch primarily affect:
    - *Where* the issue data (which includes `parentId` if set by the backend) is fetched from (now directly from GitHub).
    - *How* this data is displayed (e.g., in the revamped `TreeNav.vue`).
    - The *authentication context* under which these operations occur.

## Overall Summary of Key Functional Shifts in `karthik` Branch:

The `karthik` branch introduces substantial changes focused on robust GitHub integration and a more dynamic, user-centric experience:

1.  **Full GitHub OAuth 2.0 Authentication:** Replaces simpler/mock authentication, allowing the app to act on behalf of the user.
2.  **Direct GitHub API Interaction:** Shifts from using local backend proxies for data to making direct, authenticated calls to the GitHub API for repositories, issues, and comments.
3.  **Repository Selection:** Empowers users to choose the repository they want to work with, making the tool far more flexible.
4.  **UI Modernization & Restructuring:** Significant updates to the visual appearance (GitHub-like theme) and layout of key components (`TreeNav`, `Users`, `pages/index.vue`).
5.  **Composable-Based Architecture:** Introduction of `useAuth.ts` and `useGithub.ts` promotes better state management and separation of concerns for authentication and GitHub API interactions.

The core logic for *detecting* parent-child relationships from issue descriptions appears to be unchanged at the backend level. The `karthik` branch primarily changes *how this information is accessed and presented* in the context of a fully authenticated, repository-aware user session.
