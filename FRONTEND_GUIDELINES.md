# Frontend Guidelines

These guidelines apply to the `AdminUI` React application.

- Use React functional components with hooks.
- Keep components small and focused; prefer composition over inheritance.
- Maintain strict TypeScript checking.
- Centralize API requests in `src/services`.
- Use Zustand for global state only when necessary.
- Style components with Tailwind utility classes.
- Reuse generic UI components such as `DataTable` and `Modal`.
- Avoid committing binary files. Store large assets externally if required.
