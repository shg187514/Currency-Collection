# TreeSpace

TreeSpace is a cross-platform, production-ready workspace manager and hierarchy tree organization tool. 
It operates identically across Windows, macOS, Linux, and Cloud environments (VPS, Docker, Render, Railway).

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

You can setup the entire project with a single command from the root directory:

```bash
npm install
```
This automatically installs the dependencies for both the frontend and backend.

## Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```
*(On Windows Command Prompt, use `copy .env.example .env`)*

**Configuration options:**
- `PORT`: The port the backend runs on (default: `5000`).
- `DATABASE_URL`: Connection string for your database.
  - For **SQLite (Development)**: `file:./dev.db`
  - For **PostgreSQL (Production)**: `postgresql://user:password@localhost:5432/treespace?schema=public`
  - *Note: The system automatically switches database providers based on the URL prefix. No code changes required!*
- `UPLOAD_DIRECTORY`: Folder where attachments are saved (default: `uploads`).

## Development

To run the application in development mode (hot-reloading enabled):

```bash
npm run dev
```
This single command will:
1. Automatically configure your database.
2. Generate the Prisma Client and push the schema.
3. Start the backend API on port `5000`.
4. Start the Vite React frontend on port `5173`.

## Production Build & Deployment

To prepare the application for production:

```bash
npm run build
```
This compiles the backend TypeScript and builds the frontend React application.

To start the production server:

```bash
npm start
```
The backend Express server will automatically serve the API, the uploaded files, and the React frontend static build from a single port! 

You can deploy this repository to any cloud provider by simply providing the `.env` variables and running `npm run build && npm start`.

## Cross-Platform Support

TreeSpace uses Node.js `path` modules and dynamic directory resolution to ensure 100% compatibility across operating systems. There are no hardcoded Linux `/` or Windows `\` separators.
