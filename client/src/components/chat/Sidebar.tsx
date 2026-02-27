import { Link, useRoute } from "wouter";
import { useChats } from "@/hooks/use-chats";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { data: chats, isLoading } = useChats();
  const [match, params] = useRoute("/chat/:id");
  const activeId = match ? Number(params.id) : null;

  return (
    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border bg-background flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-secondary/50 border-b border-border">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          ChatParser
        </h2>
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : chats?.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 opacity-50" />
            </div>
            <p className="text-sm">No chats uploaded yet</p>
            <Link href="/">
              <Button variant="link" className="mt-2 text-primary">Upload one now</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {chats?.map((chat) => (
              <Link 
                key={chat.id} 
                href={`/chat/${chat.id}`}
                className={`
                  flex flex-col px-4 py-3 border-b border-border/50 cursor-pointer transition-colors
                  ${activeId === chat.id 
                    ? "bg-secondary" 
                    : "hover:bg-secondary/50 bg-background"
                  }
                `}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-medium text-foreground truncate mr-2">
                    {chat.title}
                  </span>
                  {chat.createdAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {/* Preview the first actual message if possible */}
                  {Array.isArray(chat.parsedData) && chat.parsedData.length > 0 
                    ? chat.parsedData.find(m => !(m as any).isNotification)?.text || "System message"
                    : "No messages"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
