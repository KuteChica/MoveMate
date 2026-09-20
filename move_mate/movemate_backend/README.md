# MoveMate Backend

Node.js + Express + Prisma + PostgreSQL backend for the MoveMate campus shuttle tracking system.

## 1. Setup

Copy `.env.example` to `.env` and set the PostgreSQL credentials and `DATABASE_URL` for your local `mydb` database.

Do not commit `.env`.

Install packages:

```bash
npm install
```

## 2. Create/update the database

Prisma 7 reads the migration datasource from `prisma.config.ts`. Run the migration and seed commands from `movemate_backend`:

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

The migration is stored in `prisma/migrations`, and the idempotent demo seeder is in `prisma/seed.js`.

If `mydb` already contains the tables from the old SQL setup, baseline the initial migration once before deploying it:

```bash
npx prisma migrate resolve --applied 20260919000000_init
npx prisma migrate deploy
```

For new local databases, use `npx prisma migrate dev` with a PostgreSQL user that can create shadow databases.

The existing `users` table is preserved and extended with `password_hash` and `role`.

## 3. Start the API

```bash
npm start
```

The API runs on:

`http://localhost:5000`

For hosted deployment, see [`DEPLOYMENT.md`](DEPLOYMENT.md). The repository includes a Render Blueprint at [`render.yaml`](../../render.yaml).

Test:

`GET /`

and:

`GET /db-test`

## 4. Main endpoints

### Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Users

- GET `/api/users/me`
- PATCH `/api/users/me`
- GET `/api/users` (admin)
- POST `/api/users/admin/create` (admin)

### Shuttles

- GET `/api/shuttles`
- GET `/api/shuttles/:id`
- POST `/api/shuttles` (admin/representative)
- PATCH `/api/shuttles/:id/status`

### Routes

- GET `/api/routes`
- GET `/api/routes/:id/stops`
- POST `/api/routes` (admin/representative)

### GPS

- POST `/api/locations`
- GET `/api/locations/:shuttleId/history`

The GPS endpoint is designed so the driver's phone can send location automatically. The driver does not need to type the location manually.

For a real device request, send:

```json
{
  "shuttle_id": 1,
  "latitude": 5.6508,
  "longitude": -0.1869,
  "place_name": "Legon Hall",
  "speed_kmh": 20
}
```

The backend stores every location update so historical trips and future ETA prediction can be built on top of it.

## Roles

- `student`: normal student account
- `driver`: can send shuttle GPS and update shuttle status
- `representative`: can manage routes/shuttles
- `admin`: full management access

Public registration only creates `student` accounts. Admin can create driver/representative/admin accounts.

## Frontend integration

After login, store the returned JWT:

```json
{
  "token": "...",
  "user": {
    "id": 1,
    "name": "Student",
    "email": "student@example.com",
    "role": "student"
  }
}
```

Send it on protected requests:

`Authorization: Bearer YOUR_TOKEN`

Example:

`GET http://localhost:5000/api/shuttles`

with the Authorization header.

## Important

The backend uses Prisma 7 with the PostgreSQL adapter. It does not require Sequelize or Firebase.
