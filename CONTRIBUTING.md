# Contributing to ArogyaOS

First off, thank you for considering contributing to ArogyaOS! It's people like you that make ArogyaOS such a high-quality enterprise healthcare operating system.

## Code of Conduct
Please read and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) to keep this community safe and welcoming.

## How Can I Contribute?

### Reporting Bugs
*   Check the issues tab to see if the bug has already been reported.
*   If not, open a new issue using the **Bug report** template.
*   Provide a clear summary, reproduction steps, and environmental details.

### Proposing Enhancements
*   Open an issue using the **Feature request** template.
*   Explain the problem, proposed solution, and potential impact.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Install dependencies: `npm install`
3. Make your changes, maintaining consistent design systems, tokens, and schemas.
4. Verify code format and styling: `npm run lint`
5. Run TypeScript validation check: `npx tsc --noEmit`
6. Run test suite: `npm test`
7. Build local package: `npm run build`
8. Submit a pull request targeting `main`.

## Standards and Guidelines
*   Keep files clean and avoid inline style hacks (prefer design tokens / `componentStyles` utility).
*   Always preserve and update TypeScript declarations.
*   Always include WCAG 2.2 AA accessibility requirements (proper focus, semantic tags, and aria-labels).
