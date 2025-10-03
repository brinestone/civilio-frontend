# CivilIO

CivilIO is a desktop application for managing civil status data, built with Angular and Electron.

## Project Structure

The project is a monorepo managed with pnpm workspaces, organized as follows:

-   `projects/civilio`: The main Angular application.
-   `projects/electron`: The Electron main and preload processes.
-   `libs/shared`: Shared utilities and code between the Angular and Electron apps.

## Tech Stack

-   **Frameworks**: Angular, Electron
-   **Database**: PostgreSQL with Drizzle ORM
-   **Styling**: Tailwind CSS with SCSS, `spartan-ng` UI components
-   **State Management**: NGXS
-   **Package Manager**: pnpm

## Getting Started

### Prerequisites

-   Node.js and pnpm
-   A running PostgreSQL instance

### Installation

1.  Clone the repository.
2.  Install the dependencies:

    ```bash
    pnpm install
    ```

### Development

To start the application in development mode, run:

```bash
pnpm dev
```

This will concurrently start the Angular development server and the Electron application with hot-reloading.

## Database Migrations

The project uses Drizzle ORM for database migrations.

-   To generate and apply migrations, run:

    ```bash
    pnpm migrate.local
    ```

-   To open Drizzle Studio, run:

    ```bash
    pnpm studio
    ```

## Building and Packaging

To build and package the application for production, run:

```bash
pnpm make:electron
```

This will create a distributable package in the `out` directory.

## Testing

To run the unit tests, use:

```bash
pnpm test
```

## Code Generation

The project includes custom schematics for generating new components:

-   Generate a new page:

    ```bash
    pnpm generate:page <page-name>
    ```

-   Generate a new layout:

    ```bash
    pnpm generate:layout <layout-name>
    ```

-   Generate a new component:

    ```bash
    pnpm generate:component <component-name>
    ```
