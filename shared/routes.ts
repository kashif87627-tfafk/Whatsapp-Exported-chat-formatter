import { z } from 'zod';
import { insertChatSchema, chats } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
};

export const api = {
  chats: {
    list: {
      method: 'GET' as const,
      path: '/api/chats' as const,
      responses: {
        200: z.array(z.custom<typeof chats.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/chats/:id' as const,
      responses: {
        200: z.custom<typeof chats.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/chats' as const,
      input: z.object({
        title: z.string(),
        rawText: z.string()
      }),
      responses: {
        201: z.custom<typeof chats.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ChatResponse = z.infer<typeof api.chats.get.responses[200]>;
export type ChatsListResponse = z.infer<typeof api.chats.list.responses[200]>;
