"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import MessageList from "@/components/dietician/messaging/MessageList";
import MessageThread from "@/components/dietician/messaging/MessageThread";

interface Message {
  id: number;
  message: string;
  message_type: string;
  who: string;
  created_at: string;
  consultation_id: number;
  receiver_id: number;
}

interface Client {
  id: number;
  name: string;
  avatar?: string;
  goal?: string;
}

interface Conversation {
  id: number;
  client: Client;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  messages: Message[];
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

    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        // First fetch the consultations to get the list of conversations
        const consultationsResponse = await fetch("/api/proxy/consultations/my", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!consultationsResponse.ok) {
          throw new Error("Failed to fetch consultations");
        }

        const consultationsData = await consultationsResponse.json();
        
        // Transform each consultation into a conversation
        const conversationsPromises = consultationsData.data.map(async (consultation: any) => {
          // Fetch messages for each consultation
          const messagesResponse = await fetch(`/api/proxy/consultations/${consultation.id}/messages`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!messagesResponse.ok) {
            console.error(`Failed to fetch messages for consultation ${consultation.id}`);
            return null;
          }

          const messagesData = await messagesResponse.json();
          
          return {
            id: consultation.id,
            client: {
              id: consultation.user.id,
              name: consultation.user.name,
              avatar: consultation.user.avatar,
            },
            messages: messagesData.data || [],
            lastMessage: messagesData.data?.[messagesData.data.length - 1]?.message,
            lastMessageTime: messagesData.data?.[messagesData.data.length - 1]?.created_at,
            unreadCount: 0 // You can implement actual unread count logic
          };
        });

        const fetchedConversations = (await Promise.all(conversationsPromises)).filter(Boolean);
        setConversations(fetchedConversations);
        
        if (fetchedConversations.length > 0) {
          setSelectedConversation(fetchedConversations[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSendMessage = async (message: string, consultationId: number, receiverId: number) => {
    try {
      const response = await fetch("/api/proxy/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          consultation_id: consultationId,
          message: message,
          receiver_id: receiverId,
          message_type: "text",
          who: "dietitian" // Assuming this is the dietitian sending the message
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      
      // Update the conversation with the new message
      setConversations(prev => prev.map(conv => {
        if (conv.id === consultationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage.data],
            lastMessage: newMessage.data.message,
            lastMessageTime: newMessage.data.created_at
          };
        }
        return conv;
      }));

      // Update the selected conversation if it's the current one
      if (selectedConversation?.id === consultationId) {
        setSelectedConversation(prev => ({
          ...prev!,
          messages: [...prev!.messages, newMessage.data],
          lastMessage: newMessage.data.message,
          lastMessageTime: newMessage.data.created_at
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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
              selectedId={selectedConversation?.id?.toString() || null}
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
                onSendMessage={(message) => 
                  handleSendMessage(message, selectedConversation.id, selectedConversation.client.id)
                }
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