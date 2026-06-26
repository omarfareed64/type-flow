# Deploy TypeFlow

TypeFlow has two deployable parts:

- Angular frontend: deploys to GitHub Pages.
- Express transcript API: deploys to Render or another Node host.

## Frontend: GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`.

1. Push the project to GitHub.
2. Open the GitHub repo.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `GitHub Actions`.
5. Push to `main`, or run the workflow manually from the `Actions` tab.

Your frontend URL will be:

```txt
https://omarfareed64.github.io/type-flow/
```

## Backend: Render

GitHub Pages cannot run the Express server, so transcript fetching needs a backend host.

1. Go to Render.
2. Create a new `Web Service`.
3. Connect this GitHub repo.
4. Render can use `render.yaml`, or set:

```txt
Build command: npm ci
Start command: npm run server
```

5. Set this environment variable:

```txt
FRONTEND_ORIGIN=https://omarfareed64.github.io
```

Render will give you a backend URL like:

```txt
https://typeflow-api.onrender.com
```

## Connect Frontend To Backend

After the backend is deployed:

1. Open the GitHub repo.
2. Go to `Settings` -> `Secrets and variables` -> `Actions`.
3. Open the `Variables` tab.
4. Add a repository variable:

```txt
TYPEFLOW_API_BASE_URL=https://your-render-backend-url
```

5. Re-run the GitHub Pages workflow.

The frontend will write this value into `public/app-config.json` during deployment, and transcript fetching will call:

```txt
https://your-render-backend-url/api/transcript
```

## Local Development

For local development, keep `public/app-config.json` as:

```json
{
  "apiBaseUrl": ""
}
```

Then run:

```bash
npm start
```

Angular uses `/api` locally through `proxy.conf.json`.
