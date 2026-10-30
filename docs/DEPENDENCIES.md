# Dependency versions

These versions come from the delivered lockfiles. Use `npm ci` to reproduce them. Node.js 22 and PostgreSQL 16 are selected by the Dockerfiles and Compose configuration.

## Website

| Package | Locked version | Use | Purpose |
| --- | --- | --- | --- |
| `lucide-react` | 1.64.0 | Runtime | Icons |
| `react` | 19.3.1 | Runtime | Interface components |
| `react-dom` | 19.3.1 | Runtime | Browser rendering |
| `react-router-dom` | 7.18.5 | Runtime | Page navigation |
| `@playwright/test` | 1.64.1 | Build/test | Browser and responsive-layout tests |
| `@vitejs/plugin-react` | 5.2.0 | Build/test | React build integration |
| `vite` | 6.4.5 | Build/test | Frontend builds and development server |

## API

| Package | Locked version | Use | Purpose |
| --- | --- | --- | --- |
| `bcrypt` | 6.0.0 | Runtime | Password hashing |
| `cors` | 2.8.6 | Runtime | Allowed browser-origin handling |
| `dotenv` | 17.4.2 | Runtime | Private environment configuration |
| `express` | 4.22.3 | Runtime | HTTP API framework |
| `pg` | 8.23.1 | Runtime | PostgreSQL connection pool |
| `@electric-sql/pglite` | 0.5.13 | Build/test | Isolated PostgreSQL-compatible integration tests |

Nginx and base container images currently use the tags declared in the Dockerfiles. Tags can resolve to newer image builds; record image digests with each deployment if an exact container rebuild is required. The lockfiles cover JavaScript package versions, not container image immutability.
