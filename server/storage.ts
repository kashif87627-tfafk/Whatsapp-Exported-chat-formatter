import { db } from "./db";
import { chats, type InsertChat, type Chat } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getChats(): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
}

export class DatabaseStorage implements IStorage {
  async getChats(): Promise<Chat[]> {
    return await db.select().from(chats).orderBy(desc(chats.createdAt));
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db.insert(chats).values(chat).returning();
    return newChat;
  }
}

export const storage = new DatabaseStorage();
