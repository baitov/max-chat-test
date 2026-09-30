import axios from "axios";
import type { ApiNotification, CheckAccountResponse } from "../types";

const API = "https://api.green-api.com/v3/waInstance";

export const sendText = async (
  idInstance: string,
  token: string,
  chatId: string,
  message: string,
) => {
  const { data } = await axios.post<{ idMessage: string }>(
    `${API}${idInstance}/sendMessage/${token}`,
    { chatId, message },
  );
  return data;
};

export const pullNotification = async (idInstance: string, token: string) => {
  const { data } = await axios.get<ApiNotification | null>(
    `${API}${idInstance}/receiveNotification/${token}`,
  );
  return data;
};

export const confirmNotification = async (
  idInstance: string,
  token: string,
  receiptId: number,
) => {
  await axios.delete(
    `${API}${idInstance}/deleteNotification/${token}/${receiptId}`,
  );
};

export const checkAccount = async (
  idInstance: string,
  token: string,
  phoneNumber: string,
) => {
  const { data } = await axios.post<CheckAccountResponse>(
    `${API}${idInstance}/checkAccount/${token}`,
    { phoneNumber: Number(phoneNumber) },
  );
  return data;
};
