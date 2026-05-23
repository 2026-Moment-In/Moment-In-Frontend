# MomentIn Frontend

React + TypeScript frontend for the MomentIn wedding event web app.

## File Structure

```text
Moment-In-Frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx          # React entry
    ├── App.tsx           # page flow and UI
    ├── api.ts            # backend REST / socket settings
    ├── demo.ts           # fallback demo data
    ├── types.ts          # shared TypeScript types
    ├── utils.ts          # date/title helpers
    ├── styles.css        # responsive page styling
    └── vite-env.d.ts
```

## Run

```bash
npm install
npm run dev
```

Create `.env.local` if your backend is not on `http://localhost:3000`.

```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000/live
VITE_DEMO_USER_ID=00000000-0000-0000-0000-000000000001
```
