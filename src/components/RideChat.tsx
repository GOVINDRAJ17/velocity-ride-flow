import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface RideChatProps {
  rideId: string;
}

const RideChat = ({ rideId }: RideChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rideId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [rideId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("ride_chat_messages")
        .select("*")
        .eq("ride_id", rideId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(m => m.sender_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds);

        const profilesMap = profilesData?.reduce((acc: any, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {}) || {};

        const messagesWithProfiles = data.map(m => ({
          ...m,
          profiles: profilesMap[m.sender_id]
        }));

        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`ride_chat_${rideId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_chat_messages',
          filter: `ride_id=eq.${rideId}`
        },
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ride_chat_messages")
        .insert({
          ride_id: rideId,
          sender_id: user.id,
          message_text: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Make sure you're verified.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card border-2 rounded-3xl h-[500px] flex flex-col">
      <CardHeader className="gradient-primary text-white rounded-t-3xl">
        <CardTitle className="flex items-center gap-2 text-white text-2xl">
          <MessageSquare />
          Ride Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4 pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      message.sender_id === user?.id
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {message.profiles?.full_name || "Rider"}
                      </p>
                    )}
                    <p className="text-sm break-words">{message.message_text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !newMessage.trim()}
            className="rounded-full gradient-primary text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RideChat;
