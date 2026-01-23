# Local Development

## Backend

1. Create the backend environment file from the example:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Start the backend with Docker Compose:

   ```bash
   docker compose up --build
   ```

3. Verify the health endpoint:

   ```bash
   curl http://localhost:8000/health
   ```

## Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

Note: `.npmrc` pins the public npm registry to avoid 403 errors during installs.
