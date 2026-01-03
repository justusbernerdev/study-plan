# Contributing to Study Tracker

Thank you for your interest in contributing to Study Tracker! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A Convex account (free)
- A Clerk account (free)

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone git@github.com:YOUR_USERNAME/study-plan.git
   cd study-plan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex backend**
   ```bash
   npx convex dev
   ```
   This creates a new Convex project and generates `NEXT_PUBLIC_CONVEX_URL`.

4. **Set up Clerk authentication**
   - Go to [clerk.com](https://clerk.com) and create an application
   - Copy your publishable key and secret key
   - Create `.env.local` with these values:
     ```
     NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
     ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types for props, state, and function parameters
- Avoid `any` type when possible

### Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### Naming Conventions

- **Components**: PascalCase (`CourseCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useLanguage.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE

### File Structure

```
src/components/
├── dashboard/       # Dashboard-specific components
├── providers/       # Context providers
└── ui/              # Reusable UI components
```

## Translations

When adding new text to the UI:

1. Add the English text to `src/lib/translations.ts` under the `en` object
2. Add the Finnish translation under the `fi` object
3. Use the `useLanguage()` hook to access translations:
   ```typescript
   const { t } = useLanguage();
   return <h1>{t.yourNewText}</h1>;
   ```

## Convex Backend

### Adding New Tables

1. Update `convex/schema.ts` with the new table definition
2. Create a new file in `convex/` for mutations and queries
3. Export functions in the Convex API

### Mutations & Queries

- Use `mutation` for data changes
- Use `query` for data fetching
- Validate inputs appropriately

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add translations for any new UI text
   - Test your changes locally

3. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature description"
   ```
   
   Use conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

5. **PR Review**
   - Address any feedback
   - Keep the PR focused on one feature/fix
   - Ensure all checks pass

## Reporting Issues

When reporting bugs, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots if applicable

## Feature Requests

Feature requests are welcome! Please:

- Check if the feature already exists or is planned
- Clearly describe the use case
- Consider how it fits with existing features

## Code of Conduct

- Be respectful and inclusive
- Give constructive feedback
- Help others learn and grow

## Questions?

Feel free to open an issue for any questions about contributing!

---

Thank you for helping make Study Tracker better!

