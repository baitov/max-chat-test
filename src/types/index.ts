export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type Message = {
  id: string;
  text: string;
  outgoing: boolean;
};

export type ApiNotification = {
  receiptId: number;
  body: {
    typeWebhook: string;
    senderData?: { sender: string };
    messageData?: {
      textMessageData?: { textMessage?: string };
    };
  };
};

export type CheckAccountResponse = {
  exist: boolean;
  chatId: string;
};
