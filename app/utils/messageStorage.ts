import fs from 'fs/promises';
import path from 'path';

const CHAT_DIR = path.join(process.cwd(), 'chat_data');

export async function createConversationFile(key: string) {
  await fs.mkdir(CHAT_DIR, { recursive: true });
  await fs.writeFile(path.join(CHAT_DIR, `${key}.txt`), '', { flag: 'w' });
}

export async function appendMessageToFile(key: string, message: { sender: string; text: string }) {
  await fs.appendFile(
    path.join(CHAT_DIR, `${key}.txt`),
    `${message.sender}|${message.text}\n`
  );
}

export async function readMessagesFromFile(key: string) {
  try {
    const data = await fs.readFile(path.join(CHAT_DIR, `${key}.txt`), 'utf-8');
    return data
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [sender, ...textParts] = line.split('|');
        return { sender: sender as 'user' | 'agent', text: textParts.join('|') };
      });
  } catch {
    return [];
  }
}