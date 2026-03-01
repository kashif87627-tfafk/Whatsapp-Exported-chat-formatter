import { useState, useMemo, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { useChat } from "@/hooks/use-chats";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatMessage } from "@shared/schema";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ChatView() {
  const [, params] = useRoute("/chat/:id");
  const chatId = Number(params?.id);
  const { data: chat, isLoading, error } = useChat(chatId);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState<string>("");

  // Extract unique senders
  const uniqueSenders = useMemo(() => {
    if (!chat || !Array.isArray(chat.parsedData)) return [];
    
    const senders = new Set<string>();
    chat.parsedData.forEach((m: any) => {
      if (!m.isNotification && m.sender) {
        senders.add(m.sender);
      }
    });
    return Array.from(senders);
  }, [chat]);

  // State for perspective
  const [viewAs, setViewAs] = useState<string>("");

  // Initialize perspective once senders are loaded
  useEffect(() => {
    if (uniqueSenders.length > 0 && !viewAs) {
      setViewAs(uniqueSenders[0]);
    }
  }, [uniqueSenders, viewAs]);

  // Map sender to a color index
  const senderColorMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    uniqueSenders.forEach(sender => {
      if (sender !== viewAs) {
        map.set(sender, idx++);
      }
    });
    return map;
  }, [uniqueSenders, viewAs]);

  // Auto scroll to bottom initially
  useEffect(() => {
    if (chat && scrollRef.current) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [chat]);

  // Handle scroll to track current date
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || !chat?.parsedData) return;

      const messages = chat.parsedData as ChatMessage[];
      const scrollTop = scrollRef.current.scrollTop;
      const viewportHeight = scrollRef.current.clientHeight;
      const scrollCenter = scrollTop + viewportHeight / 2;

      // Find which message is closest to the center of the viewport
      let closestDate = "";
      let closestDistance = Infinity;

      const messageElements = scrollRef.current.querySelectorAll('[data-message-date]');
      messageElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const parentRect = scrollRef.current!.getBoundingClientRect();
        const elementTop = rect.top - parentRect.top + scrollTop;
        const distance = Math.abs(elementTop - scrollCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestDate = el.getAttribute('data-message-date') || "";
        }
      });

      if (closestDate) {
        setCurrentDate(closestDate);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [chat]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center chat-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading chat history...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !chat) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center chat-background p-6 text-center">
          <div className="bg-background rounded-2xl p-8 shadow-lg max-w-md w-full">
            <Info className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chat Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The chat you're looking for doesn't exist or could not be loaded.
            </p>
            <Link href="/">
              <Button className="w-full">Upload a New Chat</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const messages = chat.parsedData as ChatMessage[];

  return (
    <AppLayout>
      <div className="flex flex-col h-full w-full relative">
        {/* Chat Header */}
        <header className="h-16 flex-shrink-0 bg-secondary/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-10">
          <div className="flex items-center min-w-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex flex-col min-w-0">
              <h2 className="font-display font-semibold text-foreground truncate text-lg leading-tight">
                {chat.title}
              </h2>
              <span className="text-xs text-muted-foreground truncate">
                {messages.length} messages • {uniqueSenders.length} participants
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block whitespace-nowrap">
              View as:
            </span>
            <Select value={viewAs} onValueChange={setViewAs}>
              <SelectTrigger className="w-[130px] sm:w-[160px] h-9 bg-background border-border/50">
                <SelectValue placeholder="Select sender" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSenders.map((sender) => (
                  <SelectItem key={sender} value={sender}>
                    {sender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-background px-4 py-6 scrollbar-thin relative"
        >
          {/* Sticky Date Header */}
          {currentDate && (
            <div className="sticky top-0 flex justify-center mb-4 z-20 pointer-events-none">
              <div className="bg-foreground/10 dark:bg-foreground/20 text-foreground/70 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                {currentDate}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto flex flex-col gap-1 pb-4">
            {/* End to end encryption fake notice */}
            <div className="flex justify-center my-4 w-full">
              <div className="bg-[#ffeecd] text-amber-900 dark:bg-amber-900/30 dark:text-amber-200/80 px-4 py-2 rounded-lg text-[11px] font-medium max-w-[90%] text-center shadow-sm border border-amber-200/50 dark:border-amber-700/30">
                Messages are parsed locally and stored in your development database. This is a visual representation of your exported chat.
              </div>
            </div>

            {messages.map((msg, idx) => {
              // Group messages logically to remove tail if needed, but keeping it simple
              const isMe = msg.sender === viewAs;
              const colorIdx = msg.sender ? senderColorMap.get(msg.sender) ?? 0 : 0;
              
              return (
                <div key={msg.id || idx} data-message-date={msg.date}>
                  <ChatBubble 
                    message={msg} 
                    isMe={isMe} 
                    colorIndex={colorIdx}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
