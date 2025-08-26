# MP3 Backend (Render Free)

A simple Express server that converts uploads to MP3 using `ffmpeg-static`.

## Local run

```bash
npm i
npm start
# server on http://localhost:10000
```

## Deploy on Render (Free)

1. Push this folder to a public GitHub repo.
2. Go to https://render.com → **New** → **Web Service** → connect your repo.
3. Select:
   - **Build Command**: `npm i`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
4. Set environment variables in Render → **Environment**:
   - `PORT` = `10000` (Render will override with its own, but keeping default helps local dev)
   - `PUBLIC_URL` = *(Render will show your onrender.com URL after first deploy — set and redeploy so download links are absolute)*
   - `CORS_ORIGIN` = `https://YOUR_VERCEL_DOMAIN.vercel.app`  (or `*` for testing)
5. Create the `uploads/` directory (Render will create it automatically on first run).

> Free instances can sleep when idle. First request may take a few seconds to spin up again.

## Endpoints

- `POST /convert` with `multipart/form-data` field `file` → `{ success, downloadUrl }`
- `GET /health` → `{ ok: true }`

## Notes

- Storage is ephemeral; files may be removed on redeploy/restart. This server auto-deletes outputs after 30 minutes.
