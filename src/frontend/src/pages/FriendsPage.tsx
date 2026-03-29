import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { useRouter } from "@tanstack/react-router";
import {
  Inbox,
  Loader2,
  MapPin,
  MessageCircle,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useFriends,
  useMyProfile,
  usePendingRequests,
  useUserProfile,
} from "../hooks/useQueries";

const GRADIENT_COLORS = [
  "from-orange-400 to-pink-500",
  "from-blue-400 to-indigo-600",
  "from-green-400 to-teal-500",
  "from-purple-400 to-pink-500",
  "from-yellow-400 to-orange-500",
  "from-cyan-400 to-blue-500",
];

function getGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % GRADIENT_COLORS.length;
  }
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

function FriendRow({
  userId,
  index,
  onMessage,
}: { userId: Principal; index: number; onMessage: () => void }) {
  const { data: profile } = useUserProfile(userId);
  const gradient = getGradient(userId.toString());

  if (!profile)
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      data-ocid={`friends.item.${index + 1}`}
    >
      <Avatar className="w-12 h-12 shrink-0">
        {profile.photo && <AvatarImage src={profile.photo.getDirectURL()} />}
        <AvatarFallback
          className={`bg-gradient-to-br ${gradient} text-white font-bold`}
        >
          {profile.displayName?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground">
          {profile.displayName}
          {profile.age ? `, ${profile.age.toString()}` : ""}
        </div>
        {profile.city && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {profile.city}
          </div>
        )}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {profile.interests.slice(0, 2).map((int) => (
              <span
                key={int}
                className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5"
              >
                {int}
              </span>
            ))}
          </div>
        )}
      </div>
      <Button
        size="sm"
        onClick={onMessage}
        data-ocid={`friends.message.button.${index + 1}`}
        className="rounded-full w-10 h-10 p-0 bg-brand-blue hover:bg-brand-blue/90 text-white shrink-0"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}

function RequestRow({ userId, index }: { userId: Principal; index: number }) {
  const { data: profile } = useUserProfile(userId);
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const gradient = getGradient(userId.toString());

  const handleAccept = async () => {
    try {
      await accept.mutateAsync(userId);
      toast.success("Friend request accepted!");
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async () => {
    try {
      await decline.mutateAsync(userId);
      toast.success("Request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  if (!profile)
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      data-ocid={`requests.item.${index + 1}`}
    >
      <Avatar className="w-12 h-12 shrink-0">
        {profile.photo && <AvatarImage src={profile.photo.getDirectURL()} />}
        <AvatarFallback
          className={`bg-gradient-to-br ${gradient} text-white font-bold`}
        >
          {profile.displayName?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground">
          {profile.displayName}
        </div>
        {profile.city && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {profile.city}
          </div>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={accept.isPending}
          data-ocid={`requests.accept.button.${index + 1}`}
          className="rounded-full h-9 px-3 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs"
        >
          {accept.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 mr-1" />
          )}
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={decline.isPending}
          data-ocid={`requests.decline.button.${index + 1}`}
          className="rounded-full h-9 w-9 p-0"
        >
          <UserX className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const { identity, login } = useInternetIdentity();
  const router = useRouter();
  const { data: myProfile, isLoading: profileLoading } = useMyProfile();
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: requests, isLoading: requestsLoading } = usePendingRequests();

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 pt-16">
        <h2 className="font-display font-bold text-2xl text-center">
          Log in to see your friends
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
        data-ocid="friends.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!myProfile) {
    router.navigate({ to: "/setup" });
    return null;
  }

  return (
    <div data-ocid="friends.section">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display font-bold text-2xl text-foreground mb-0.5">
          Friends
        </h1>
        <p className="text-muted-foreground text-sm">
          Your connections and incoming requests
        </p>
      </div>

      <Tabs defaultValue="friends" data-ocid="friends.tabs" className="px-4">
        <TabsList className="rounded-full bg-muted border border-border mb-4 p-1 w-full">
          <TabsTrigger
            value="friends"
            className="rounded-full flex items-center gap-1.5 flex-1 text-sm"
            data-ocid="friends.tab"
          >
            <Users className="w-3.5 h-3.5" />
            Friends
            {friends && friends.length > 0 && (
              <Badge className="ml-1 bg-brand-blue text-white text-xs rounded-full px-1.5 py-0 h-4">
                {friends.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="rounded-full flex items-center gap-1.5 flex-1 text-sm"
            data-ocid="requests.tab"
          >
            <Inbox className="w-3.5 h-3.5" />
            Requests
            {requests && requests.length > 0 && (
              <Badge className="ml-1 bg-brand-orange text-white text-xs rounded-full px-1.5 py-0 h-4">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="-mx-4">
          {friendsLoading ? (
            <div
              className="space-y-0 divide-y divide-border"
              data-ocid="friends.loading_state"
            >
              {["f1", "f2", "f3"].map((skId) => (
                <div key={skId} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : !friends || friends.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center px-4"
              data-ocid="friends.empty_state"
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-base mb-2">
                No friends yet
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                Discover people with shared interests.
              </p>
              <Button
                onClick={() => router.navigate({ to: "/discover" })}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8"
                data-ocid="friends.discover.button"
              >
                Discover People
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border" data-ocid="friends.list">
              {friends.map((userId, i) => (
                <FriendRow
                  key={userId.toString()}
                  userId={userId}
                  index={i}
                  onMessage={() =>
                    router.navigate({
                      to: "/chat/$friendId",
                      params: { friendId: userId.toString() },
                    })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="-mx-4">
          {requestsLoading ? (
            <div
              className="space-y-0 divide-y divide-border"
              data-ocid="requests.loading_state"
            >
              {["r1", "r2"].map((skId) => (
                <div key={skId} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : !requests || requests.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center px-4"
              data-ocid="requests.empty_state"
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-base mb-2">
                No pending requests
              </h3>
              <p className="text-muted-foreground text-sm">
                Friend requests you receive will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((userId, i) => (
                <RequestRow key={userId.toString()} userId={userId} index={i} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
