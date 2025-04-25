"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import MessageList from "@/components/dietician/messaging/MessageList";
import MessageThread from "@/components/dietician/messaging/MessageThread";
import { mockConversations } from "@/lib/mock-data";

export default function MessagingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Simulate fetching messages
    const timer = setTimeout(() => {
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
      setIsLoading(false);
    }, 1000);

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

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
              selectedId={selectedConversation?.id}
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