export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface Message {
  id: string;
  text: string;
  outgoing: boolean;
}

export interface ApiNotification {
  receiptId: number;
  body: {
    typeWebhook: string;
    senderData?: { sender: string };
    messageData?: {
      textMessageData?: { textMessage?: string };
    };
  };
}
