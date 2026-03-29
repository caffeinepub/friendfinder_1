import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal as PrincipalLib } from "@dfinity/principal";
import type { Principal } from "@icp-sdk/core/principal";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MapPin, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useConversation,
  useFriends,
  useMyProfile,
  useSendMessage,
  useUserProfile,
} from "../hooks/useQueries";

const GRADIENT_COLORS = [
  "from-orange-400 to-pink-500",
  "from-blue-400 to-indigo-600",
  "from-green-400 to-teal-500",
  "from-purple-400 to-pink-500",
];

function getGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % GRADIENT_COLORS.length;
  }
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

function FriendListItem({
  userId,
  index,
  onClick,
}: {
  userId: Principal;
  index: number;
  onClick: () => void;
}) {
  const { data: profile } = useUserProfile(userId);
  const gradient = getGradient(userId.toString());

  if (!profile)
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`chat.friend.item.${index + 1}`}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
    >
      <Avatar className="w-12 h-12 shrink-0">
        {profile?.photo && <AvatarImage src={profile.photo.getDirectURL()} />}
        <AvatarFallback
          className={`bg-gradient-to-br ${gradient} text-white font-bold`}
        >
          {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground">
          {profile?.displayName ?? "Loading..."}
        </div>
        {profile?.city && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {profile.city}
          </div>
        )}
      </div>
      <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function ChatPage() {
  const { identity, login } = useInternetIdentity();
  const router = useRouter();
  const params = useParams({ strict: false }) as { friendId?: string };
  const { data: myProfile, isLoading: profileLoading } = useMyProfile();
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const [selectedFriendId, setSelectedFriendId] = useState<Principal | null>(
    null,
  );
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendMessage();

  // Set selected friend from URL param
  useEffect(() => {
    if (params.friendId) {
      try {
        const p = PrincipalLib.fromText(params.friendId);
        setSelectedFriendId(p);
      } catch {
        // invalid principal
      }
    } else {
      setSelectedFriendId(null);
    }
  }, [params.friendId]);

  const { data: messages, isLoading: messagesLoading } =
    useConversation(selectedFriendId);
  const { data: selectedFriendProfile } = useUserProfile(selectedFriendId);
  const { identity: currentIdentity } = useInternetIdentity();
  const myPrincipal = currentIdentity?.getPrincipal();

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change is intentional
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 pt-16">
        <h2 className="font-display font-bold text-2xl text-center">
          Log in to access chats
        </h2>
        <Button
          onClick={() => login()}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12"
        >
          Log In
        </Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div
        className="flex items-center justify-center pt-24"
        data-ocid="chat.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!myProfile) {
    router.navigate({ to: "/setup" });
    return null;
  }

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedFriendId) return;
    const content = messageInput.trim();
    setMessageInput("");
    try {
      await sendMessage.mutateAsync({ to: selectedFriendId, content });
    } catch {
      toast.error("Failed to send message");
      setMessageInput(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Chat conversation view (when a friend is selected)
  if (selectedFriendId) {
    return (
      <div
        className="flex flex-col h-full"
        style={{ height: "calc(100dvh - 14rem)" }}
      >
        {/* Chat header */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedFriendId(null);
              router.navigate({ to: "/chat" });
            }}
            className="p-2 -ml-1 rounded-full hover:bg-muted transition-colors"
            data-ocid="chat.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9">
            {selectedFriendProfile?.photo && (
              <AvatarImage src={selectedFriendProfile.photo.getDirectURL()} />
            )}
            <AvatarFallback
              className={`bg-gradient-to-br ${getGradient(selectedFriendId.toString())} text-white font-bold text-sm`}
            >
              {selectedFriendProfile?.displayName?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              {selectedFriendProfile?.displayName ?? "Loading..."}
            </div>
            {selectedFriendProfile?.city && (
              <div className="text-xs text-muted-foreground">
                {selectedFriendProfile.city}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          {messagesLoading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="chat.messages.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div
              className="text-center py-8"
              data-ocid="chat.messages.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello to{" "}
                {selectedFriendProfile?.displayName ?? "your friend"}!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => {
                const isMe = myPrincipal?.toString() === msg.from.toString();
                return (
                  <div
                    key={`${msg.from.toString()}-${msg.timestamp.toString()}-${i}`}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      data-ocid={`chat.message.item.${i + 1}`}
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMe
                          ? "bg-brand-orange text-white rounded-br-sm"
                          : "bg-card text-foreground shadow-xs rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                      <div
                        className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        {new Date(
                          Number(msg.timestamp) / 1_000_000,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="bg-card border-t border-border px-4 py-3 flex items-center gap-2 shrink-0">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedFriendProfile?.displayName ?? "friend"}...`}
            className="rounded-full flex-1 h-11"
            data-ocid="chat.message.input"
          />
          <Button
            onClick={handleSend}
            disabled={!messageInput.trim() || sendMessage.isPending}
            data-ocid="chat.send.button"
            className="rounded-full w-11 h-11 p-0 bg-brand-orange hover:bg-brand-orange/90 text-white shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Friends list view (no chat selected)
  return (
    <div data-ocid="chat.section">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display font-bold text-2xl text-foreground mb-0.5">
          Messages
        </h1>
        <p className="text-muted-foreground text-sm">Chat with your friends</p>
      </div>

      {friendsLoading ? (
        <div
          className="space-y-0 divide-y divide-border"
          data-ocid="chat.sidebar.loading_state"
        >
          {["c1", "c2", "c3", "c4"].map((skId) => (
            <div key={skId} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : !friends || friends.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center px-8"
          data-ocid="chat.sidebar.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-lg mb-2">
            No friends yet
          </h3>
          <p className="text-muted-foreground text-sm mb-5">
            Add friends on the Discover page to start chatting.
          </p>
          <Button
            onClick={() => router.navigate({ to: "/discover" })}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8"
            data-ocid="chat.discover.button"
          >
            Discover People
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {friends.map((userId, i) => (
            <FriendListItem
              key={userId.toString()}
              userId={userId}
              index={i}
              onClick={() => {
                setSelectedFriendId(userId);
                router.navigate({
                  to: "/chat/$friendId",
                  params: { friendId: userId.toString() },
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
