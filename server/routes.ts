import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";
import type { ChatMessage } from "@shared/schema";

// 🟢 In-memory storage (MUST be outside routes)
let offlineChats: any[] = [];

function parseWhatsAppChat(rawText: string): ChatMessage[] {
  const lines = rawText.split('\n');
  const messages: ChatMessage[] = [];
  
  const regex = /^\[?(\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s|\u202F)?(?:[ap]m|AM|PM)?)\]?\s*(?:-\s*)?(.*)$/i;

  let currentMessage: ChatMessage | null = null;
  let idCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(regex);
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const date = match[1];
      const time = match[2];
      const content = match[3];
      
      const contentMatch = content.match(/^([^:]+):\s*(.*)$/);
      
      if (contentMatch) {
        currentMessage = {
          id: String(idCounter++),
          isNotification: false,
          date,
          time,
          sender: contentMatch[1].trim(),
          text: contentMatch[2]
        };
      } else {
        currentMessage = {
          id: String(idCounter++),
          isNotification: true,
          date,
          time,
          text: content
        };
      }
    } else {
      if (currentMessage) {
        currentMessage.text += '\n' + line;
      }
    }
  }
  
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // 🟢 LIST ALL CHATS (offline)
  app.get(api.chats.list.path, async (_req, res) => {
    res.json(offlineChats);
  });

  // 🟢 GET SINGLE CHAT (offline)
  app.get(api.chats.get.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const chat = offlineChats.find(c => c.id === id);

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  // 🟢 CREATE CHAT (offline, no database)
  app.post(api.chats.create.path, async (req, res) => {
    try {
      const input = api.chats.create.input.parse(req.body);
      const parsedData = parseWhatsAppChat(input.rawText);

      const chat = {
        id: Date.now(), // unique ID
        title: input.title,
        parsedData,
        createdAt: new Date(),
      };

      // ⭐ THIS WAS MISSING IN YOUR CODE (CRITICAL)
      offlineChats.push(chat);

      res.status(201).json(chat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  return httpServer;
}