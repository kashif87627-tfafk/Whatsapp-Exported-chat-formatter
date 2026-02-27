import { ReactNode } from "react";
import { Sidebar } from "../chat/Sidebar";
import { useRoute } from "wouter";

export function AppLayout({ children }: { children: ReactNode }) {
  const [isChatRoute] = useRoute("/chat/:id");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar: hidden on mobile if we are viewing a chat */}
      <div className={`h-full ${isChatRoute ? "hidden md:flex" : "flex w-full md:w-auto"}`}>
        <Sidebar />
      </div>
      
      {/* Main Content: hidden on mobile if we are NOT viewing a chat */}
      <div className={`flex-1 h-full overflow-hidden relative ${!isChatRoute ? "hidden md:flex" : "flex"}`}>
        {children}
      </div>
    </div>
  );
}
