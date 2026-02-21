# Back

Backend NestJS pour le quiz (API REST + WebSocket).

## Demarrage rapide

1. Copier `.env.example` vers `.env` et ajuster.
2. Lancer Postgres + Redis:
   - `docker compose up -d`
3. Installer les dependances:
   - `npm install`
4. Generer Prisma + migration:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
5. Lancer le serveur:
   - `npm run dev`

## Endpoints (extraits)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/quizzes`
- `POST /api/sessions`
- `POST /api/sessions/:code/join`

## WebSocket

- `join-session` { code }
- `host:start` { code }
- `host:next` { code }
- `host:reveal` { code }
- `player:answer` { code, playerId, questionId, choiceId }
