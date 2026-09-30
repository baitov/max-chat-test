import { useState } from "react";
import type { Credentials } from "./types";
import LoginScreen from "./components/LoginScreen";
import ChatScreen from "./components/ChatScreen";
import "./app.css";

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(null);

  if (!creds) return <LoginScreen onSubmit={setCreds} />;

  return <ChatScreen credentials={creds} onLogout={() => setCreds(null)} />;
}
