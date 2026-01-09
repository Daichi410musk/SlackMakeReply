import "dotenv/config";
import { Hono } from "hono";
import { WebClient } from "@slack/web-api";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

// Slack Bot を準備
const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
  throw new Error("SLACK_BOT_TOKEN is not set");
}
const slack = new WebClient(token);

// Slackに送るAPI
app.post("/api/slack/postMessage", async (c) => {
  const { channelId, text } = await c.req.json();

  if (!channelId || !text) {
    return c.json({ error: "channelId and text are required" }, 400);
  }

  await slack.chat.postMessage({
    channel: channelId,
    text,
  });

  return c.json({ ok: true });
});

//チャンネル取得
app.get("/api/slack/channels", async (c) => {
  try {
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
  } catch (err) {
    console.error("Slack API error:", err);
    return c.json({ error: "Slack API failed" }, 500);
  }
});

// 🔽 これが「サーバー起動」
serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("🚀 Server running on http://localhost:3000");
