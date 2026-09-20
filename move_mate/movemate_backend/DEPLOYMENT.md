# Deploy the backend on Render

## 1. Push the repository

Push the project to GitHub. Do not commit `.env` or real credentials.

## 2. Create the service

In Render, choose **New > Blueprint** and select the repository. Render will read the root `render.yaml` file and create:

- A PostgreSQL database named `movemate-db`
- A Node web service named `movemate-api`

The web service uses `move_mate/movemate_backend` as its root directory.

## 3. Set secrets

In the Render web service environment settings, set:

```text
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
```

`DATABASE_URL` and `JWT_SECRET` are configured by `render.yaml`.

## 4. Deploy and seed

The service runs `prisma migrate deploy` before starting. After the first successful deploy, open the Render Shell for the web service and run:

```bash
npm run prisma:seed
```

This creates the configured admin account and demo route, stops, shuttle, and GPS location.

## 5. Test the deployment

Use the URL Render gives the service:

```text
https://your-service.onrender.com/
https://your-service.onrender.com/api-docs
```

The API health response should be:

```json
{
  "message": "MoveMate API is running.",
  "version": "1.0.0"
}
```

## 6. Connect the frontend

Set the frontend environment variable to the deployed API URL before building:

```text
VITE_API_URL=https://your-service.onrender.com
```

Then redeploy the frontend.
