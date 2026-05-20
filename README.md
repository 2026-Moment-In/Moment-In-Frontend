# MomentIn Frontend

React + TypeScript + Vite frontend for the MomentIn wedding event app.

## Teammate Setup

If you cloned this repository from GitHub, do this first.

1. Install dependencies.

```bash
npm install
```

2. Create `Moment-In-Frontend/.env`.

Ask a teammate for the real `.env` file, or create this local version:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000/live
VITE_DEMO_USER_ID=00000000-0000-0000-0000-000000000001
```

3. Start the frontend.

```bash
npm run dev
```

4. Open the app.

```text
http://localhost:5173
```

The backend must also be running at `http://localhost:3000`.

## Main Routes

```text
/                         Landing / dev login
/admin                    Admin wedding list
/admin/create             Wedding editor
/admin/dashboard/:id      Admin dashboard
/enter                    Guest code entry
/wedding/:code            Guest wedding info
/wedding/:code/photos     Guest photo upload/feed
/wedding/:code/ranking    Guest ranking
/wedding/:code/guestbook  Guestbook
/live/:code               Live screen
```

## Scripts

```bash
npm run dev      # local dev server
npm run build    # TypeScript + production build
npm run preview  # preview production build
```

## Notes

- Do not commit `.env`.
- If the backend port changes, update `VITE_API_URL` and `VITE_SOCKET_URL`.
- Static images are committed under `public/images`.
