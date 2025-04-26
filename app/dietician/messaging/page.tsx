"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import MessageList from "@/components/dietician/messaging/MessageList";
import MessageThread from "@/components/dietician/messaging/MessageThread";
import { mockConversations } from "@/lib/mock-data";

// Define the types directly in this file
interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface Client {
  id: string;
  name: string;
  avatar: string;
  goal: string;
}

interface Conversation {
  id: string;
  client: Client;
  unread: boolean;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function MessagingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Simulate fetching messages
    const timer = setTimeout(() => {
      // Ensure mock data matches Conversation type
      const formattedConversations: Conversation[] = mockConversations.map(conv => ({
        ...conv,
        lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
        lastMessageTime: conv.messages[conv.messages.length - 1]?.timestamp || '',
        unreadCount: conv.unread ? 1 : 0
      }));
      
      setConversations(formattedConversations);
      if (formattedConversations.length > 0) {
        setSelectedConversation(formattedConversations[0]);
      }
      setIsLoading(false);
    }, 1000);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] overflow-hidden rounded-lg bg-background shadow-sm">
      <div className="flex h-full">
        {(!isMobileView || !selectedConversation) && (
          <div className={`h-full ${selectedConversation && isMobileView ? 'hidden' : 'w-full md:w-1/3 border-r'}`}>
            <MessageList 
              conversations={conversations}
              selectedId={selectedConversation?.id || null} // Ensure null instead of undefined
              onSelect={(conversation) => setSelectedConversation(conversation)}
            />
          </div>
        )}
        
        {(!isMobileView || selectedConversation) && (
          <div className={`h-full ${!selectedConversation && isMobileView ? 'hidden' : 'w-full md:w-2/3'}`}>
            {selectedConversation ? (
              <MessageThread 
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
                isMobileView={isMobileView}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}