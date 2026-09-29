import { useState } from "react";
import type { FormEvent } from "react";
import type { Credentials } from "../types";

type Props = {
  onSubmit: (creds: Credentials) => void;
};

export default function LoginScreen({ onSubmit }: Props) {
  const [id, setId] = useState("");
  const [token, setToken] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !token.trim()) return;
    onSubmit({ idInstance: id.trim(), apiTokenInstance: token.trim() });
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <h1>Вход</h1>
        <p className="login__hint">Данные из личного кабинета GREEN-API</p>

        <label className="login__field">
          <span>idInstance</span>
          <input value={id} onChange={(e) => setId(e.target.value)} />
        </label>

        <label className="login__field">
          <span>apiTokenInstance</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} />
        </label>

        <button type="submit" className="login__submit">
          Войти
        </button>
      </form>
    </div>
  );
}
