
# Project TODO

- [x] Keep the vault private per authenticated user across login sessions
- [x] Persist code entries with title, language, category, tags, notes, code content, favorite status, and UTC timestamps
- [x] Enforce ownership for create, read, update, delete, and favorite operations
- [x] Implement create, view, edit, delete, and favorite interactions
- [x] Add syntax-highlighted editor/viewer and one-click copy action
- [x] Add keyword search and filters for language, category, tag, and favorites
- [x] Build an elegant responsive dashboard for mobile and desktop
- [x] Add clear loading, empty, and error states
- [x] Add and run Vitest coverage for code-vault behavior
- [x] Verify the application visually and functionally before delivery
- [x] Refine the visual identity with a stronger code-and-vault motif and a more distinctive empty-vault experience
- [x] Store snippet timestamps in an explicitly UTC-safe format and update schema/API/UI accordingly
- [x] Replace the plain code textarea with a genuinely syntax-highlighted editing experience
- [x] Browser-test authenticated CRUD, favorite, copy, search/filter, and failure states; record/fix any issues before marking verification complete
- [x] Update snippet edit/favorite flows to always write a fresh UTC millisecond updatedAt and verify changed timestamps after mutations
- [x] Browser-test at least one real failure path for vault actions, document the observed behavior, and fix any issue before delivery
- [x] Verify updatedAt changes after edit and favorite mutations with automated coverage or a browser/API check
