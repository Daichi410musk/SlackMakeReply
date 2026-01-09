import "dotenv/config";
import { WebClient } from "@slack/web-api"; // Slack公式SDK

const token = process.env.SLACK_BOT_TOKEN; // .envから読む

if (!token) {
  throw new Error("SLACK_BOT_TOKEN is not set");
}

const client = new WebClient(token);

async function main() {
  const res = await client.chat.postMessage({
    channel: "C09UXT4BXV2", // ← さっき見つけた Channel ID
    text: "MVP3 疎通テスト 🚀",
  });

  console.log("sent:", res.ok);
}

main().catch(console.error);
