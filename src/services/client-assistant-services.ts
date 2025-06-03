import { Message } from '@/lib/types';

export const BASE_URL = 'https://api.mincaai-franciamexico.com';

const createChatId = async (): Promise<{ chatId: string }> => {
  const res = await fetch(`${BASE_URL}/chat/createChatId?type=web`, {
    method: 'POST',
  });
  return res.json();
};

const getChatMessages = async (chatID: string): Promise<Message[]> => {
  const response = await fetch(`${BASE_URL}/chat/${chatID}/message`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
const createMessage = async (
  chatId: string,
  message: string
): Promise<{ reply: string }> => {
  const response = await fetch(`${BASE_URL}/chat/${chatId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const lastActivity = async (chatId: string): Promise<{ status: string }> => {
  const response = await fetch(`${BASE_URL}/chat/${chatId}/last_activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
export { createMessage, createChatId, getChatMessages, lastActivity };
