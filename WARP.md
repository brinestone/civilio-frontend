# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture

This is a monorepo for a desktop application named CivilIO, built with Angular and Electron. The project is managed with pnpm workspaces.

-   `projects/civilio`: Contains the main Angular application. This is where the majority of the UI components and frontend logic resides.
-   `projects/electron`: Holds the Electron main and preload process files.
-   `libs/shared`: Intended for shared utilities and code between the Angular and Electron applications, though it may be empty.
-   `assets/i18n`: Contains translation files.

The tech stack includes:
-   **Frameworks**: Angular & Electron
-   **UI & Styling**: Tailwind CSS, SCSS, and `spartan-ng` components.
-   **State Management**: NGXS is used for state management in the Angular app.
-   **Database**: PostgreSQL with Drizzle ORM for database operations and migrations.
-   **Package Manager**: This project uses `pnpm`.

## Common Commands

-   **Installation**: `pnpm install`
-   **Development**: `pnpm dev` - Concurrently starts the Angular dev server and Electron with hot-reloading.
-   **Testing**: `pnpm test` - Runs the unit tests for the Angular application.
-   **Building the application**: `pnpm make:electron` - Creates a distributable package in the `out` directory.

### Database
-   **Generate and apply migrations**: `pnpm migrate.local`
-   **Open Drizzle Studio**: `pnpm studio`

### Code Generation
The project uses Angular CLI with custom schematics to generate new parts of the application.
-   **Generate a new page component**: `pnpm generate:page <page-name>`
-   **Generate a new layout component**: `pnpm generate:layout <layout-name>`
-   **Generate a new component**: `pnpm generate:component <component-name>`
