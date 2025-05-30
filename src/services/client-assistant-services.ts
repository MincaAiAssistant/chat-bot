import { Message } from '@/lib/types';

export const BASE_URL = 'https://api.mincaai-franciamexico.com';

const getChatId = async (): Promise<{ chatId: string }> => {
  const response = await fetch(`${BASE_URL}/chat/getChatId`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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
export { createMessage, getChatId, getChatMessages, lastActivity };
