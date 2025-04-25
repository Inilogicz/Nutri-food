"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
  conversations: any[];
  selectedId: string | null;
  onSelect: (conversation: any) => void;
}

export default function MessageList({ conversations, selectedId, onSelect }: MessageListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(conversation => 
    conversation.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              return (
                <div
                  key={conversation.id}
                  className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/50 ${
                    selectedId === conversation.id ? "bg-muted" : ""
                  }`}
                  onClick={() => onSelect(conversation)}
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={conversation.client.avatar} alt={conversation.client.name} />
                    <AvatarFallback>{conversation.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.client.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lastMessage.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="truncate text-xs text-muted-foreground">
                        {lastMessage.content}
                      </p>
                      {conversation.unread && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-purple-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              No conversations found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}