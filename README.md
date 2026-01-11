# SlackMakeReply

**OverView**
- Generation of reply text
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4299015/67600254-e021-4960-b55e-f7648d999199.gif" width=300px>

- Mention and Channel Selection
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4299015/97393212-2e77-4aff-b19c-6f67dbcc24e5.gif" width=300px>

- Edit and Send Reply
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4299015/e6344373-fc7b-47c0-b29d-3922b6d16246.gif" width=300px>

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
  ** If tsx is missing: npm i -D tsx

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
