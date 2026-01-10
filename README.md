SlackQuickReply

A small tool that generates short reply suggestions for Slack messages and lets you send them directly.
Frontend: Vite + React. Backend: Hono + Slack Web API + OpenAI.

Requirements
- Node.js 18+ (recommended 20+)
- Slack Bot Token (scopes: channels:read, users:read, chat:write)
- OpenAI API Key

Setup
1) Install dependencies
   npm install

2) Create .env
   SLACK_BOT_TOKEN=your-slack-bot-token
   OPENAI_API_KEY=your-openai-api-key

Development
- Frontend (Vite):
  npm run dev

- Backend (Hono server):
  npx tsx server/index.ts
  : If tsx is missing: npm i -D tsx

Endpoints
- GET /api/slack/channels
- GET /api/slack/users
- POST /api/generate-replies
- POST /api/slack/postMessage

Tests
- Tests are written with Vitest and React Testing Library.
- npm test
- make test

Notes
- Slack Bot Token must be granted in your workspace.
- The OpenAI model is configured in server/app.ts.
