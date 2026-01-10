import { useEffect, useState } from "react";

type Channel = { id: string; name: string };
type User = { id: string; name: string };

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [channelId, setChannelId] = useState("");
  const [mentionUserId, setMentionUserId] = useState("");

  const [originalMessage, setOriginalMessage] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);

  // チャンネル取得
  useEffect(() => {
    fetch("http://localhost:3000/api/slack/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data.channels));
  }, []);

  // ユーザー取得
  useEffect(() => {
    fetch("http://localhost:3000/api/slack/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users));
  }, []);

  // 返信生成
  const generateReplies = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:3000/api/generate-replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalMessage }),
    });
    const data = await res.json();
    setReplies(data.replies);
    setLoading(false);
  };

  // Slack送信
  const sendMessage = async () => {
    const finalText = mentionUserId ? `<@${mentionUserId}> ${text}` : text;

    await fetch("http://localhost:3000/api/slack/postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
        text: finalText,
      }),
    });

    alert("送信した");
    setOriginalMessage("");
    setReplies([]);
    setText("");
    setChannelId("");
    setMentionUserId("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Slack Reply</h2>

      <h3>① 元メッセージ</h3>
      <textarea
        rows={4}
        value={originalMessage}
        onChange={(e) => setOriginalMessage(e.target.value)}
        style={{ width: "100%" }}
      />

      <button onClick={generateReplies} disabled={loading || !originalMessage}>
        {loading ? "生成中..." : "返信案を生成"}
      </button>

      <h3>② 返信案</h3>
      {replies.map((r, i) => (
        <div
          key={i}
          onClick={() => setText(r)}
          style={{
            padding: 8,
            marginBottom: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {r}
        </div>
      ))}

      <h3>③ メンション（任意）</h3>
      <select
        value={mentionUserId}
        onChange={(e) => setMentionUserId(e.target.value)}
      >
        <option value="">メンションなし</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <h3>④ Slack送信</h3>
      <select value={channelId} onChange={(e) => setChannelId(e.target.value)}>
        <option value="">チャンネル選択</option>
        {channels.map((ch) => (
          <option key={ch.id} value={ch.id}>
            #{ch.name}
          </option>
        ))}
      </select>

      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={sendMessage} disabled={!text || !channelId}>
        Slackに送信
      </button>
    </div>
  );
}

export default App;
