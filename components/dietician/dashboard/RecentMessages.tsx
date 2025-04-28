"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/new/dietician/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: boolean;
}

export default function RecentMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        setLoading(true);
        // First fetch the consultations
        const consultationsResponse = await fetch("/api/proxy/consultations/my", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!consultationsResponse.ok) {
          throw new Error("Failed to fetch consultations");
        }

        const consultationsData = await consultationsResponse.json();
        
        // Get the most recent message for each consultation
        const conversationsWithMessages = await Promise.all(
          consultationsData.data.map(async (consultation: any) => {
            const messagesResponse = await fetch(
              `/api/proxy/consultations/${consultation.id}/messages`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (!messagesResponse.ok) {
              console.error(`Failed to fetch messages for consultation ${consultation.id}`);
              return null;
            }

            const messagesData = await messagesResponse.json();
            const lastMessage = messagesData.data?.[messagesData.data.length - 1];

            return {
              id: consultation.id,
              client: {
                id: consultation.user.id,
                name: consultation.user.name,
                avatar: consultation.user.avatar,
              },
              lastMessage: lastMessage?.message,
              lastMessageTime: lastMessage?.created_at,
              unread: false // You would implement actual unread logic based on your API
            };
          })
        );

        // Filter out null values and sort by most recent
        const validConversations = conversationsWithMessages.filter(Boolean) as Conversation[];
        const sortedConversations = validConversations.sort((a, b) => 
          new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
        );

        setConversations(sortedConversations.slice(0, 3)); // Get top 3 most recent
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessages();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Messages</CardTitle>
        <Link href="/dietician/messaging">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dietician/messaging?id=${conversation.id}`}
                className="block"
              >
                <div className={`flex items-start justify-between rounded-lg border p-4 transition-all hover:bg-muted/50 ${conversation.unread ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={conversation.client.avatar} alt={conversation.client.name} />
                      <AvatarFallback>{conversation.client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium leading-none">
                          {conversation.client.name}
                        </h4>
                        {conversation.unread && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      {conversation.lastMessageTime && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium">No messages yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              When clients message you, they'll appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}