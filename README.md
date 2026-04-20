# Shop Ability

Accessible grocery planning with budget tracking, price scanning, and a lightweight backend proxy for secure image-based price extraction.

## Recommended hosting

This repo now includes a Render Blueprint at the repository root:

`render.yaml`

It deploys the price proxy as a small Node web service and keeps `OPENAI_API_KEY` on the server.

## App setup

1. Install app dependencies

```bash
npm install
```

2. Add frontend env vars

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_PRICE_PROXY_URL` to your backend URL.

For Render, this will look like:

`https://your-render-service.onrender.com`

## Backend proxy setup

1. Add backend env vars

```bash
cp backend/.env.example backend/.env
```

2. Put your OpenAI server-side key in `backend/.env`

`OPENAI_API_KEY=...`

3. Start the proxy

```bash
npm run proxy
```

By default it runs on `http://localhost:8787`.

For a real phone on your local network, set `EXPO_PUBLIC_PRICE_PROXY_URL` to your computer's LAN IP, for example:

`http://192.168.1.100:8787`

## Deploy the proxy on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint deployment from the repo.
3. Render will detect `render.yaml` and create `shop-ability-price-proxy`.
4. In the Render dashboard, set:

`OPENAI_API_KEY`

5. After deploy, copy the public `.onrender.com` URL into your app `.env` as:

`EXPO_PUBLIC_PRICE_PROXY_URL=https://your-render-service.onrender.com`

6. Restart Expo so the app picks up the new public proxy URL.

## Run the app

```bash
npm start
```

## TestFlight

1. Install and log into EAS CLI

```bash
npm install -g eas-cli
eas login
```

2. Configure Apple credentials when prompted and build for iOS

```bash
eas build --platform ios --profile production
```

3. Submit the finished build to TestFlight

```bash
eas submit --platform ios --profile production
```

For future JS-only changes, you may be able to use EAS Update instead of a full rebuild. Native or config changes still require a new iOS build.

## Notes

- The mobile app never needs the OpenAI API key directly.
- The scanner calls the backend proxy at `/api/extract-price`.
- You can check the proxy with `GET /health`.
