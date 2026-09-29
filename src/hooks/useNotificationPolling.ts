import { useEffect, useRef } from "react";
import { pullNotification, confirmNotification } from "../api/greenApi";

type Handler = (from: string, text: string) => void;

export function useNotificationPolling(
  idInstance: string,
  token: string,
  enabled: boolean,
  onMessage: Handler,
  interval = 3000,
) {
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !idInstance || !token) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const notif = await pullNotification(idInstance, token);
        if (!notif || cancelled) return;

        const { receiptId, body } = notif;
        if (body.typeWebhook === "incomingMessageReceived") {
          const from = body.senderData?.sender;
          const text = body.messageData?.textMessageData?.textMessage;
          if (from && text) handlerRef.current(from, text);
        }

        await confirmNotification(idInstance, token, receiptId);
      } catch (e) {
        console.warn("notification polling failed", e);
      }
    };

    const timer = setInterval(tick, interval);
    tick();

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [idInstance, token, enabled, interval]);
}
