import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import type { Credentials, Message } from "../types";
import { sendText, checkAccount } from "../api/greenApi";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import { Message as Bubble } from "./Message";

type Props = {
  credentials: Credentials;
  onLogout: () => void;
};

let messageCounter = 0;
const newId = () => `m${Date.now()}-${messageCounter++}`;

const digitsOnly = (s: string) => s.replace(/\D/g, "");

const formatPhone = (raw: string) => {
  const d = digitsOnly(raw);
  if (d.length === 11 && d.startsWith("7")) {
    return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
  }
  if (d.length === 12 && d.startsWith("375")) {
    return `+375 ${d.slice(3, 5)} ${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10)}`;
  }
  return raw;
};

export default function ChatScreen({ credentials, onLogout }: Props) {
  const { idInstance, apiTokenInstance } = credentials;

  const [chatId, setChatId] = useState<string | null>(null);
  const [peerLabel, setPeerLabel] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIncoming = useCallback(
    (from: string, text: string) => {
      if (!chatId) return;
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

  const openChat = async (e: FormEvent) => {
    e.preventDefault();
    const raw = phoneInput.trim();
    if (!raw) return;

    setError(null);
    setLoading(true);

    try {
      const digits = digitsOnly(raw);
      const looksLikePhone = digits.length >= 10 && digits.length <= 15;

      if (looksLikePhone) {
        const result = await checkAccount(idInstance, apiTokenInstance, digits);
        if (!result.exist || !result.chatId) {
          setError("По этому номеру не найден пользователь MAX");
          return;
        }
        setChatId(result.chatId);
        setPeerLabel(formatPhone(digits));
      } else {
        setChatId(raw);
        setPeerLabel(raw);
      }

      setMessages([]);
      setPhoneInput("");
    } catch (err) {
      console.error(err);
      setError("Не удалось найти пользователя по этому номеру");
    } finally {
      setLoading(false);
    }
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

  const closeChat = () => {
    setChatId(null);
    setPeerLabel("");
    setMessages([]);
    setError(null);
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
            placeholder="Номер телефона (79991234567)"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Ищем..." : "Открыть"}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="topbar__back" onClick={closeChat}>
          ←
        </button>
        <span>{peerLabel}</span>
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
