import axios from "axios";
import type { ApiNotification } from "../types";

const API_HOST = "https://api.green-api.com/v3/waInstance";

const buildUrl = (id: string, token: string, method: string) =>
  `${API_HOST}${id}/${method}/${token}`;

export async function sendText(
  idInstance: string,
  apiToken: string,
  chatId: string,
  text: string,
) {
  const { data } = await axios.post(
    buildUrl(idInstance, apiToken, "sendMessage"),
    {
      chatId,
      message: text,
    },
  );
  return data as { idMessage: string };
}

export async function fetchNotification(idInstance: string, apiToken: string) {
  const { data } = await axios.get<ApiNotification | null>(
    buildUrl(idInstance, apiToken, "receiveNotification"),
  );
  return data;
}

export async function dropNotification(
  idInstance: string,
  apiToken: string,
  receiptId: number,
) {
  await axios.delete(
    buildUrl(idInstance, apiToken, `deleteNotification/${receiptId}`),
  );
}
