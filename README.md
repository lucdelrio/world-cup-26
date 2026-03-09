# World Cup 2026

2026 World Cup fixture app (USA, Mexico, Canada). Deployable to **App Store** and **Google Play**. Matches are loaded from an **external source** (not hardcoded) so the app stays up to date if dates or venues change.

## Data sources (pick one)

### 1. JSON URL
Create `.env` in the project root:
```bash
EXPO_PUBLIC_FIXTURE_JSON_URL=https://your-domain.com/world-cup-26/fixture.json
```
The JSON must be an **array** of matches. Each object: `id`, `homeTeam`, `awayTeam`, `date` (ISO 8601). Optional: `time`, `venue`, `city`, `stage`, `homeGoals`, `awayGoals`, `status`.

### 2. API-Football (api-sports.io)
Sign up at [API-Sports](https://api-sports.io/), get your API key, and in `.env`:
```bash
EXPO_PUBLIC_API_FOOTBALL_KEY=your_api_key
```

## Run

```bash
npm install
npx expo start
```

Add assets: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/favicon.png` (or copy from a blank Expo app).

## Deploy

- EAS: `npm i -g eas-cli`, `eas login`, `eas build:configure`
- iOS: `npm run build:ios`
- Android: `npm run build:android`

Set the env vars in [expo.dev](https://expo.dev) → project → Secrets for production builds.
