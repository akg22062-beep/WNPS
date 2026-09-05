<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a24251f8-d634-4997-b02f-7edae547b928

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Persistent Database API

The project includes an optional Express API for server-side persistence. It stores students, receipts, and expenses in `data/school-database.json` and creates the file automatically.

1. Start the API in a second terminal:
   `npm run server`
2. Check the API:
   `http://localhost:3001/api/health`

Available endpoints are `GET /api/database`, `GET /api/students`, `GET /api/receipts`, `GET /api/expenses`, plus `POST`, `PUT`, and `DELETE` for each resource. Set `PORT`, `CLIENT_ORIGIN`, or `SCHOOL_DB_FILE` as environment variables when deploying.

For a public deployment, set `API_ACCESS_TOKEN` on the API and the matching `VITE_API_TOKEN` when building the frontend. Never put Gemini or other private keys in `.env.example` or client-side `VITE_` variables.

## Production release

Build the frontend and start the combined website/API server:

```bash
npm run build
npm start
```

The website and API are then available from the same `PORT` (default `3001`). The frontend uses localStorage by default; set `VITE_API_URL` before building if server persistence is required.
