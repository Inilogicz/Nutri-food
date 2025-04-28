"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/app/new/dietician/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, PaperclipIcon } from "lucide-react";
import { format } from "date-fns";

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
}

interface Conversation {
  id: number;
  client: Client;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
}

interface MessageThreadProps {
  conversation: Conversation;
  onBack: () => void;
  isMobileView: boolean;
  onSendMessage: (message: string, consultationId: number, receiverId: number) => Promise<void>;
}

export default function MessageThread({ 
  conversation, 
  onBack, 
  isMobileView,
  onSendMessage
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      await onSendMessage(newMessage, conversation.id, conversation.client.id);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isClient = message.who === "user"; // Assuming 'user' is the client
    return (
      <div
        key={message.id}
        className={`mb-4 flex ${isClient ? "justify-start" : "justify-end"}`}
      >
        {isClient && (
          <Avatar className="mr-2 h-8 w-8 mt-1 border">
            <AvatarImage src={conversation.client.avatar} alt={conversation.client.name} />
            <AvatarFallback>{conversation.client.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <div className={`max-w-[75%] ${isClient ? "" : "order-1"}`}>
          <div
            className={`rounded-lg p-3 ${
              isClient
                ? "bg-muted text-foreground"
                : "bg-purple-600 text-white"
            }`}
          >
            <p className="text-sm">{message.message}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {format(new Date(message.created_at), "h:mm a")}
          </p>
        </div>
        {!isClient && (
          <Avatar className="ml-2 h-8 w-8 mt-1 border">
            <AvatarImage 
              src="https://images.pexels.com/photos/7465580/pexels-photo-7465580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Dietitian" 
            />
            <AvatarFallback>D</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        {isMobileView && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center">
          <Avatar className="mr-2 h-8 w-8 border">
            <AvatarImage src={conversation.client.avatar} alt={conversation.client.name} />
            <AvatarFallback>{conversation.client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{conversation.client.name}</h3>
            <p className="text-xs text-muted-foreground">
              {conversation.lastMessageTime && format(new Date(conversation.lastMessageTime), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {conversation.messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground"
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-700"
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}