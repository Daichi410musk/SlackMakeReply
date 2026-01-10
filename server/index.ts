import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { WebClient } from "@slack/web-api";
import OpenAI from "openai";

const app = new Hono();
app.use("*", cors());

// ===== Slack =====
const slackToken = process.env.SLACK_BOT_TOKEN;
if (!slackToken) throw new Error("SLACK_BOT_TOKEN is not set");
const slack = new WebClient(slackToken);

// ===== OpenAI =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== Slack送信 =====
app.post("/api/slack/postMessage", async (c) => {
  const { channelId, text } = await c.req.json();
  await slack.chat.postMessage({ channel: channelId, text });
  return c.json({ ok: true });
});

// ===== チャンネル一覧 =====
app.get("/api/slack/channels", async (c) => {
  const res = await slack.conversations.list({
    types: "public_channel",
    exclude_archived: true,
  });

  const channels =
    res.channels?.map((ch) => ({
      id: ch.id,
      name: ch.name,
    })) ?? [];

  return c.json({ channels });
});

// ===== ユーザー一覧（メンション用）=====
app.get("/api/slack/users", async (c) => {
  const res = await slack.users.list({});

  const users =
    res.members
      ?.filter((u) => !u.is_bot && !u.deleted)
      .map((u) => ({
        id: u.id,
        name: u.real_name || u.name,
      })) ?? [];

  return c.json({ users });
});

// ===== AI返信生成 =====
app.post("/api/generate-replies", async (c) => {
  const { originalMessage } = await c.req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Slack用の自然で短い返信文を作るアシスタントです。",
      },
      {
        role: "user",
        content: `次のメッセージに対する返信案を2つ作ってください。\n\n${originalMessage}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "";
  const replies = raw
    .split("\n")
    .map((r) => r.replace(/^\d+[.)]?\s*/, "").trim())
    .filter(Boolean);

  return c.json({ replies });
});

// ===== Server起動 =====
serve({ fetch: app.fetch, port: 3000 });
console.log("🚀 Server running on http://localhost:3000");
