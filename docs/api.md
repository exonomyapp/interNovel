# Internovel API Documentation

This document provides an overview of the Internovel API endpoints.

## Authentication

All API endpoints require authentication. The user's session is used to identify the user.

## Endpoints

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