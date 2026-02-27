import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import type { ChatMessage } from "@shared/schema";

function parseWhatsAppChat(rawText: string): ChatMessage[] {
  const lines = rawText.split('\n');
  const messages: ChatMessage[] = [];
  
  // Handles both Android and iOS export formats:
  // Android: "10/02/2026, 3:38 pm - Sender: Msg"
  // iOS: "[10/02/2026, 3:38:00 PM] Sender: Msg"
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
      
      // Messages have a colon ":" like "Sender: text"
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
      // If it doesn't match the start format, it's a multi-line message part
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
  app.get(api.chats.list.path, async (req, res) => {
    try {
      const allChats = await storage.getChats();
      res.json(allChats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get(api.chats.get.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }
      
      const chat = await storage.getChat(id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post(api.chats.create.path, async (req, res) => {
    try {
      const input = api.chats.create.input.parse(req.body);
      const parsedData = parseWhatsAppChat(input.rawText);
      
      const chat = await storage.createChat({
        title: input.title,
        parsedData,
      });
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
