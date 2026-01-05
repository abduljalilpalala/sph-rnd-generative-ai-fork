---
name: 🤖 Claude – Acceptance Criteria
about: Structured acceptance criteria for instructing Claude to implement a feature
title: '[Feature]: '
labels: acceptance-criteria, claude
---

@claude

## Feature Overview

Briefly describe the feature or enhancement to be implemented.

> Example: Implement Post Management and Role Management with full CRUD functionality.

---

## High-Level Requirements

List the main objectives Claude must accomplish.

-
-

---

## Functional Requirements

Specify the required functionality in clear bullet points.

- Implement **full CRUD functionality** for:
  -
  -
- Use **modal dialogs** for **Create** and **Edit** actions (no separate pages).
- Ensure all actions are fully wired and functional.

---

## Backend Requirements

Define how the backend should behave.

- Implement proper **API routes** for:
  - Create
  - Read
  - Update
  - Delete
- Persist data using the **existing database setup**  
  _(or create a simple schema aligned with the current project if needed)_
- Apply **basic validation and error handling** for all CRUD operations.
- Return clear and consistent API responses.

---

## Frontend Requirements

Define UI and client-side expectations.

- Use **Next.js** routing and navigation best practices.
- Connect all UI actions to backend APIs.
- Reuse the **same design, layout, and components** from:
  - (Reference existing section, e.g., User Management)
- Display:
  - Loading states
  - Success feedback
  - Error messages
- Ensure UI is **responsive** and consistent with the app’s theme.

---

## Non-Functional / General Requirements

Quality and maintainability expectations.

- Follow **clean, maintainable, and scalable code practices**.
- Ensure the feature works **end-to-end**:
  - UI → API → Database
- Avoid implementing features outside the defined scope.
- Do not introduce unnecessary dependencies.

---

## Acceptance Criteria (Verification)

This task is complete when:

- All CRUD operations work correctly
- Modals behave as expected for create/edit
- API endpoints are tested and functional
- UI matches existing patterns
- No console or runtime errors occur

---

## Out of Scope

Explicitly list what should NOT be implemented.

-
-
