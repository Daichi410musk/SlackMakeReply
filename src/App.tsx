import { useEffect, useState } from "react";

type Channel = {
  id: string;
  name: string;
};

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // チャンネル一覧取得
  useEffect(() => {
    fetch("http://localhost:3000/api/slack/channels")
      .then((res) => res.json())
      .then((data) => {
        setChannels(data.channels);
      });
  }, []);

  // 送信処理
  const sendMessage = async () => {
    if (!channelId || !text) {
      alert("チャンネルとメッセージを入力して");
      return;
    }

    setLoading(true);

    await fetch("http://localhost:3000/api/slack/postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId,
        text,
      }),
    });

    setText("");
    setLoading(false);
    alert("送信した");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Slack Quick Reply</h2>

      <div>
        <select
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
        >
          <option value="">チャンネルを選択</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              #{ch.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <textarea
          rows={5}
          cols={40}
          placeholder="送るメッセージ"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "送信中..." : "送信"}
        </button>
      </div>
    </div>
  );
}

export default App;
