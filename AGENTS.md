# AGENTS.md

## Project Context
- **Tech Stack:** TypeScript (Strict Mode), Node.js, Tailwind CSS, HTML
- **Package Manager:** pnpm

## Development Commands
- **Install:** `pnpm install`
- **Build:** `pnpm build` (Always run this after structural changes)
- **Test:** `pnpm test` (Must pass before any feature completion)
- **Lint:** `pnpm lint --fix` (Use this to resolve formatting before final output)
- **Start dev server:** `pnpm dev`

## TypeScript & Coding Standards
- **Strict Typing:** Avoid `any` at all costs. Use unknown or explicit interfaces.
- **Naming:** 
  - Interfaces: PascalCase and don't prefix it with `I`
  - Use functional patterns where possible
  - Functions: camelCase and descriptive (e.g., `fetchUserDataById`)
- **Exports:** Prefer named exports over default exports for better IDE intellisense.
- **Async:** Always use `async/await` with `try/catch` blocks for API calls.

## Project Structure
- `src/`: Core logic and components.
- `src/types/`: Centralized TypeScript definitions.
- `tests/`: All unit and integration tests.

## Boundaries & Constraints
- **Critical Files:** Do not modify `tsconfig.json` or `package.json` without asking.
- **Testing:** Do not mark a task as complete if `npm test` fails.
- **Dependencies:** Ask before adding any new npm packages.