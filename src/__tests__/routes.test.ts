// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { app as appValue } from "../../server/app";

const postMessage = vi.fn();
const conversationsList = vi.fn();
const usersList = vi.fn();
const openAiCreate = vi.fn();

class WebClientMock {
  chat = { postMessage };
  conversations = { list: conversationsList };
  users = { list: usersList };
}

class OpenAIMock {
  chat = { completions: { create: openAiCreate } };
}

vi.mock("@slack/web-api", () => ({
  WebClient: WebClientMock,
}));

vi.mock("openai", () => ({
  default: OpenAIMock,
}));

type AppType = typeof appValue;

describe("server routes", () => {
  let app: AppType;

  beforeAll(async () => {
    process.env.SLACK_BOT_TOKEN = "test-token";
    process.env.OPENAI_API_KEY = "test-key";
    ({ app } = await import("../../server/app"));
  });

  beforeEach(() => {
    postMessage.mockReset();
    conversationsList.mockReset();
    usersList.mockReset();
    openAiCreate.mockReset();
  });

  it("lists channels", async () => {
    conversationsList.mockResolvedValue({
      channels: [
        { id: "C1", name: "general" },
        { id: "C2", name: "random" },
      ],
    });

    const res = await app.fetch(
      new Request("http://localhost/api/slack/channels")
    );
    const json = await res.json();

    expect(json).toEqual({
      channels: [
        { id: "C1", name: "general" },
        { id: "C2", name: "random" },
      ],
    });
  });

  it("lists users for mentions", async () => {
    usersList.mockResolvedValue({
      members: [
        { id: "U1", name: "alice", real_name: "Alice", is_bot: false },
        { id: "U2", name: "bot", real_name: "Bot", is_bot: true },
        { id: "U3", name: "deleted", deleted: true, is_bot: false },
      ],
    });

    const res = await app.fetch(
      new Request("http://localhost/api/slack/users")
    );
    const json = await res.json();

    expect(json).toEqual({
      users: [{ id: "U1", name: "Alice" }],
    });
  });

  it("posts message to Slack", async () => {
    postMessage.mockResolvedValue({});

    const res = await app.fetch(
      new Request("http://localhost/api/slack/postMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: "C1", text: "hello" }),
      })
    );

    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(postMessage).toHaveBeenCalledWith({ channel: "C1", text: "hello" });
  });

  it("generates reply suggestions", async () => {
    openAiCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "1. 了解です\n2) かしこまりました",
          },
        },
      ],
    });

    const res = await app.fetch(
      new Request("http://localhost/api/generate-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalMessage: "お願いできますか" }),
      })
    );
    const json = await res.json();

    expect(json).toEqual({
      replies: ["了解です", "かしこまりました"],
    });
  });
});
