import type { Message as Msg } from "../types";

type Props = {
  message: Msg;
};

export function Message({ message }: Props) {
  return (
    <div
      className={`bubble ${message.outgoing ? "bubble--out" : "bubble--in"}`}
    >
      {message.text}
    </div>
  );
}
