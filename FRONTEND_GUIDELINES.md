# Frontend Guidelines

These guidelines apply to the `AdminUI` React application.

- Use React functional components with hooks.
- Keep components small and focused; prefer composition over inheritance.
- Maintain strict TypeScript checking.
- Centralize API requests in `src/services`.
- Use Zustand for global state only when necessary.
- Style components using `styled-components` and a shared theme.
- Reuse generic UI components such as `DataTable` and `Modal`.
- Avoid committing binary files. Store large assets externally if required.

## Reusable Components

- Keep foundational components like `Button`, `Input`, and `Card` under `src/components/common` so pages share the same building blocks.
- Compose complex widgets from these primitives to maintain a unified look and reduce duplication.
- Use `clsx` for conditional class names instead of inline styles.
- Provide layout templates in `src/layout` to standardize page structure.
- Document component APIs in a `README.md` inside each component folder.
