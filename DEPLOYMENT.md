# Deployment setup

Create **two Vercel projects** from the same GitHub repository:

1. Backend project root directory: `backend`
2. Frontend project root directory: `frontend`

Disable Vercel's automatic Git deployment on both; GitHub Actions is the deployment authority.

Backend environment variables:
- `RAWG_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `CORS_ORIGINS` (include the production frontend origin)

GitHub repository secrets are documented in `README.md`.
