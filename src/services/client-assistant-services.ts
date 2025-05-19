import {
  ClientChat,
  ClientMessage,
  CustomerChat,
  CustomerMessage,
} from '@/lib/types';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getClientChats = async (): Promise<ClientChat[]> => {
  const response = await fetch(`${BASE_URL}/customer-chat`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const getClientChatMessages = async (
  sessionId: string
): Promise<ClientMessage[]> => {
  const response = await fetch(
    `${BASE_URL}/customer-chat/${sessionId}/message`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const initClientChat = async (
  formData: FormData
): Promise<{
  customer_chat: CustomerChat;
  sessionid: string;
  user: CustomerMessage;
  assistant: CustomerMessage;
}> => {
  const response = await fetch(`${BASE_URL}/customer-chat/init`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const addClientMessage = async (
  formData: FormData,
  sessionId: string
): Promise<{ user: ClientMessage; assistant: ClientMessage }> => {
  const response = await fetch(
    `${BASE_URL}/customer-chat/${sessionId}/message`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export {
  getClientChats,
  getClientChatMessages,
  initClientChat,
  addClientMessage,
};
