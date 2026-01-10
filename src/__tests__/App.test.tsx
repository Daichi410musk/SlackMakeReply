import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../App";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
});

describe("App", () => {
  it("loads channels and users on mount", async () => {
    mockFetch.mockImplementation(async (input: RequestInfo) => {
      const url = input.toString();
      if (url.endsWith("/api/slack/channels")) {
        return new Response(
          JSON.stringify({
            channels: [
              { id: "C1", name: "general" },
              { id: "C2", name: "random" },
            ],
          }),
        );
      }
      if (url.endsWith("/api/slack/users")) {
        return new Response(
          JSON.stringify({
            users: [
              { id: "U1", name: "Alice" },
              { id: "U2", name: "Bob" },
            ],
          }),
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText("#general")).toBeInTheDocument();
    expect(await screen.findByText("#random")).toBeInTheDocument();
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  it("generates replies and allows selecting one", async () => {
    mockFetch.mockImplementation(async (input: RequestInfo) => {
      const url = input.toString();
      if (url.endsWith("/api/slack/channels")) {
        return new Response(JSON.stringify({ channels: [] }));
      }
      if (url.endsWith("/api/slack/users")) {
        return new Response(JSON.stringify({ users: [] }));
      }
      if (url.endsWith("/api/generate-replies")) {
        return new Response(
          JSON.stringify({ replies: ["了解です", "かしこまりました"] }),
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    render(<App />);

    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "お願いします" },
    });

    const button = screen.getByRole("button", { name: "返信案を生成" });
    fireEvent.click(button);

    expect(button).toHaveTextContent("生成中...");

    const reply = await screen.findByText("了解です");
    fireEvent.click(reply);

    await waitFor(() => {
      const inputs = screen.getAllByRole("textbox");
      expect((inputs[1] as HTMLTextAreaElement).value).toBe("了解です");
    });
  });

  it("sends message with mention and resets fields", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    mockFetch.mockImplementation(async (input: RequestInfo, init?: RequestInit) => {
      const url = input.toString();
      if (url.endsWith("/api/slack/channels")) {
        return new Response(
          JSON.stringify({
            channels: [{ id: "C1", name: "general" }],
          }),
        );
      }
      if (url.endsWith("/api/slack/users")) {
        return new Response(
          JSON.stringify({
            users: [{ id: "U1", name: "Alice" }],
          }),
        );
      }
      if (url.endsWith("/api/slack/postMessage")) {
        return new Response(JSON.stringify({ ok: true }));
      }
      throw new Error(`Unexpected fetch: ${url} ${JSON.stringify(init)}`);
    });

    render(<App />);

    await screen.findByText("Alice");
    await screen.findByText("#general");

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "U1" } });
    fireEvent.change(selects[1], { target: { value: "C1" } });
    fireEvent.change(screen.getAllByRole("textbox")[1], {
      target: { value: "テスト送信" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Slackに送信" }));

    await waitFor(() => {
      const call = mockFetch.mock.calls.find((c) =>
        c[0].toString().endsWith("/api/slack/postMessage"),
      );
      expect(call).toBeTruthy();
    });

    const postCall = mockFetch.mock.calls.find((c) =>
      c[0].toString().endsWith("/api/slack/postMessage"),
    );
    const body = JSON.parse(postCall?.[1]?.body as string);

    expect(body).toEqual({
      channelId: "C1",
      text: "<@U1> テスト送信",
    });

    await waitFor(() => {
      const textareas = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
      expect(textareas[0].value).toBe("");
      expect(textareas[1].value).toBe("");
    });

    alertSpy.mockRestore();
  });
});
