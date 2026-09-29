import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import type { Credentials, Message } from "../types";
import { sendText } from "../api/greenApi";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import { Message as Bubble } from "./Message";

type Props = {
  credentials: Credentials;
  onLogout: () => void;
};

let messageCounter = 0;
const newId = () => `m${Date.now()}-${messageCounter++}`;

export default function ChatScreen({ credentials, onLogout }: Props) {
  const { idInstance, apiTokenInstance } = credentials;

  const [chatId, setChatId] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleIncoming = useCallback(
    (from: string, text: string) => {
      if (from !== chatId) return;
      setMessages((prev) => [...prev, { id: newId(), text, outgoing: false }]);
    },
    [chatId],
  );

  useNotificationPolling(
    idInstance,
    apiTokenInstance,
    !!chatId,
    handleIncoming,
  );

  const openChat = (e: FormEvent) => {
    e.preventDefault();
    const value = phoneInput.trim();
    if (!value) return;
    setChatId(value);
    setMessages([]);
    setPhoneInput("");
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text || !chatId) return;

    setError(null);
    try {
      await sendText(idInstance, apiTokenInstance, chatId, text);
      setMessages((prev) => [...prev, { id: newId(), text, outgoing: true }]);
      setDraft("");
    } catch (e) {
      console.error(e);
      setError("Сообщение не ушло");
    }
  };

  if (!chatId) {
    return (
      <div className="screen">
        <header className="topbar">
          <span>MAX chat</span>
          <button onClick={onLogout}>Выйти</button>
        </header>

        <form className="newchat" onSubmit={openChat}>
          <h2>Новый чат</h2>
          <input
            placeholder="Номер телефона"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />
          <button type="submit">Открыть</button>
        </form>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="topbar__back" onClick={() => setChatId(null)}>
          ←
        </button>
        <span>{chatId}</span>
        <button onClick={onLogout}>Выйти</button>
      </header>

      <div className="messages">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Сообщение..."
        />
        <button onClick={submit}>→</button>
      </div>
    </div>
  );
}
