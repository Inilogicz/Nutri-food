"use client";

import Link from "next/link";
import { Button } from "@/app/new/dietician/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { mockConversations } from "@/lib/mock-data";

export default function RecentMessages() {
  // Get recent messages (newest first)
  const recentMessages = mockConversations
    .map(conversation => ({
      id: conversation.id,
      client: conversation.client,
      timestamp: conversation.messages[conversation.messages.length - 1]?.timestamp || new Date().toISOString(),
      lastMessage: conversation.messages[conversation.messages.length - 1]?.content || "",
      unread: conversation.unread,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Messages</CardTitle>
        <Link href="/dietician/messaging">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentMessages.length > 0 ? (
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <Link
                key={message.id}
                href={`/dietician/messaging?id=${message.id}`}
                className="block"
              >
                <div className={`flex items-start justify-between rounded-lg border p-4 transition-all hover:bg-muted/50 ${message.unread ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={message.client.avatar} alt={message.client.name} />
                      <AvatarFallback>{message.client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium leading-none">
                          {message.client.name}
                        </h4>
                        {message.unread && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {message.lastMessage}
                      </p>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </div>
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