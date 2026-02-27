import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Error logging helper
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useChats() {
  return useQuery({
    queryKey: [api.chats.list.path],
    queryFn: async () => {
      const res = await fetch(api.chats.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      return parseWithLogging(api.chats.list.responses[200], data, "chats.list");
    },
  });
}

export function useChat(id: number) {
  return useQuery({
    queryKey: [api.chats.get.path, id],
    queryFn: async () => {
      if (isNaN(id)) return null;
      const url = buildUrl(api.chats.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch chat");
      const data = await res.json();
      return parseWithLogging(api.chats.get.responses[200], data, "chats.get");
    },
    enabled: !isNaN(id),
  });
}

type CreateChatInput = z.infer<typeof api.chats.create.input>;

export function useCreateChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateChatInput) => {
      const validated = api.chats.create.input.parse(input);
      const res = await fetch(api.chats.create.path, {
        method: api.chats.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = parseWithLogging(api.chats.create.responses[400], data, "chats.create.error");
          throw new Error(error.message);
        }
        throw new Error("Failed to create chat");
      }
      
      return parseWithLogging(api.chats.create.responses[201], data, "chats.create.success");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    },
  });
}
