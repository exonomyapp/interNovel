# Change Management Process

All updates to code throughout a development session must be recorded, step-by-step, in `CHANGELOG.md`. Each entry in the changelog must have a timestamp as a trailing element, in the format `YYYY-MM-DD HH:MM`.

This file serves as a temporary log of changes. At the end of a session, its contents will be distilled into documentation updates that reflect the current state of the application. The official documentation in the `docs/` folder is a reflection of the application's current state, not a chronological log of the steps taken to get there. These docs will be updated from the session's changelog.md and changelog.md will be reformated for a fresh session of new changes.

When changelog entries are integrated into the `docs/` folder, they must retain their original timestamp from `CHANGELOG.md`. This ensures that the history of when a feature or change was implemented is preserved.
