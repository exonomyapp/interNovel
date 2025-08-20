# Internovel API Documentation

This document provides an overview of the Internovel API endpoints.

## Authentication

User authentication is managed via Digital Identifiers (DIDs). The following endpoints are used for registration and verification.

### `POST /api/auth/register`

Creates a new user account.

**Request Body**

- `did` (string, required): The user's Decentralized Identifier.
- `publicKey` (string, required): The user's public key for signature verification.

### `POST /api/auth/verify`

Verifies a user's signature to authenticate their session. `2024-07-22 18:14`

**Request Body**

- `signature` (string, required): The signature to be verified.
- `message` (string, required): The original message that was signed.

Upon successful verification, a JSON Web Token (JWT) is returned. This token must be included in the `Authorization` header of subsequent requests to protected endpoints as a Bearer token.

`Authorization: Bearer <token>`

The following endpoints require authentication:
- `/api/profile`
- `/api/profile/avatar`
- `/api/characters`
- `/api/casting-studio/{characterId}`
- `/api/travel-trunks`
- `/api/proposals`

## Endpoints

### Profile

#### `GET /api/profile`

Retrieves the profile of the authenticated user. `2024-07-22 18:20`

#### `POST /api/profile/avatar`

Uploads a new avatar for the authenticated user. `2024-07-22 18:17`

**Request Body**

- `avatar` (file, required): The avatar image file.


### Casting Studio

#### `GET /api/casting-studio`

Retrieves all characters that are listed in the Casting Studio.

#### `PATCH /api/casting-studio/{characterId}`

Updates the `listed` status of a character.

**Parameters**

- `characterId` (integer, required): The ID of the character to update.

**Request Body**

- `listed` (boolean, required): The new `listed` status of the character.

### Characters

#### `GET /api/characters`

Retrieves all characters for the authenticated user.

#### `POST /api/characters`

Creates a new character.

**Request Body**

- `name` (string, required): The name of the character.
- `bio` (string, required): The biography of the character.

### Travel Trunks

#### `GET /api/travel-trunks/{characterId}`

Retrieves all travel trunk items for a character.

**Parameters**

- `characterId` (integer, required): The ID of the character.

#### `POST /api/travel-trunks`

Creates a new travel trunk item.

**Request Body**

- `characterId` (integer, required): The ID of the character.
- `narrativeSample` (string, required): The narrative sample for the travel trunk item.

### Proposals

#### `POST /api/proposals`

Creates a new proposal to integrate a character into a novel.

**Request Body**

- `characterId` (integer, required): The ID of the character being proposed.
- `novelId` (integer, required): The ID of the novel the character is being proposed for.

#### `GET /api/proposals/{characterId}`

Retrieves all proposals for a specific character.

**Parameters**

- `characterId` (integer, required): The ID of the character.