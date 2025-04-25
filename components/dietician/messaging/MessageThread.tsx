"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/app/new/dietician/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, PaperclipIcon } from "lucide-react";
import { format } from "date-fns";

interface MessageThreadProps {
  conversation: any;
  onBack: () => void;
  isMobileView: boolean;
}

export default function MessageThread({ conversation, onBack, isMobileView }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to the API
    // For now, we'll just log it
    console.log("Sending message:", newMessage);
    
    // Clear the input
    setNewMessage("");
  };

  const renderMessage = (message: any) => {
    const isClient = message.sender === "client";
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
            <p className="text-sm">{message.content}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {format(new Date(message.timestamp), "h:mm a")}
          </p>
        </div>
        {!isClient && (
          <Avatar className="ml-2 h-8 w-8 mt-1 border">
            <AvatarImage 
              src="https://images.pexels.com/photos/7465580/pexels-photo-7465580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Dr. Fit Foodie" 
            />
            <AvatarFallback>FF</AvatarFallback>
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
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}