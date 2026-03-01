import { ChatMessage } from "@shared/schema";
import { format } from "date-fns";

interface ChatBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  colorIndex?: number;
}

// Array of nice colors for sender names
const SENDER_COLORS = [
  "text-emerald-600 dark:text-emerald-400",
  "text-blue-600 dark:text-blue-400",
  "text-purple-600 dark:text-purple-400",
  "text-rose-600 dark:text-rose-400",
  "text-amber-600 dark:text-amber-400",
  "text-indigo-600 dark:text-indigo-400",
];

export function ChatBubble({ message, isMe, colorIndex = 0 }: ChatBubbleProps) {
  if (message.isNotification) {
    return (
      <div className="flex justify-center my-3 w-full">
        <div className="bg-foreground/10 dark:bg-foreground/20 text-foreground/70 backdrop-blur-sm px-4 py-1.5 rounded-lg text-xs max-w-[85%] text-center shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  const senderColor = SENDER_COLORS[colorIndex % SENDER_COLORS.length];

  return (
    <div className={`flex w-full my-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
      <div 
        className={`
          relative max-w-[85%] md:max-w-[75%] px-3 pt-2 pb-1.5 shadow-sm
          ${isMe 
            ? "bg-[hsl(var(--bubble-out))] text-foreground rounded-xl rounded-tr-sm" 
            : "bg-[hsl(var(--bubble-in))] text-foreground rounded-xl rounded-tl-sm"
          }
        `}
      >
        {!isMe && message.sender && (
          <div className={`text-xs font-bold mb-0.5 ${senderColor}`}>
            {message.sender}
          </div>
        )}
        
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
          <span className="inline-block w-12" /> {/* Spacer for time layout */}
        </div>
        
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <span className="text-[10px] text-foreground/50 italic pointer-events-none select-none">
            {message.date && <span>{message.date}</span>}
            {message.date && message.time && <span>•</span>}
            {message.time && <span>{message.time}</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
