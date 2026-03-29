import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import type { Profile } from "../backend";

const GRADIENT_COLORS = [
  "from-orange-400 to-pink-500",
  "from-blue-400 to-indigo-600",
  "from-green-400 to-teal-500",
  "from-purple-400 to-pink-500",
  "from-yellow-400 to-orange-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-red-500",
  "from-violet-400 to-purple-600",
];

function getGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % GRADIENT_COLORS.length;
  }
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

interface ProfileCardProps {
  profile: Profile;
  userId?: Principal | null;
  onConnect?: () => void;
  onMessage?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  mode?: "discover" | "friend" | "request";
  isLoading?: boolean;
  index?: number;
  isVerified?: boolean;
}

export default function ProfileCard({
  profile,
  userId,
  onConnect,
  onMessage,
  onAccept,
  onDecline,
  mode = "discover",
  isLoading,
  index = 0,
  isVerified,
}: ProfileCardProps) {
  const seed = userId?.toString() ?? profile.displayName;
  const gradient = getGradient(seed);

  return (
    <div
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden flex flex-col"
      data-ocid={`profile.item.${index + 1}`}
    >
      {/* Photo / Avatar */}
      <div className="relative">
        {profile.photo ? (
          <img
            src={profile.photo.getDirectURL()}
            alt={profile.displayName}
            className="w-full h-44 object-cover"
          />
        ) : (
          <div
            className={`w-full h-44 bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <span className="text-white font-display font-bold text-4xl">
              {profile.displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
              {profile.displayName}, {profile.age?.toString()}
              {isVerified && (
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              )}
            </h3>
            {profile.city && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Interest chips */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.interests.slice(0, 4).map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal"
              >
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 4 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal"
              >
                +{profile.interests.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 flex gap-2">
          {mode === "discover" && (
            <Button
              size="sm"
              onClick={onConnect}
              disabled={isLoading}
              data-ocid={`profile.connect.button.${index + 1}`}
              className="flex-1 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              Connect
            </Button>
          )}
          {mode === "friend" && (
            <Button
              size="sm"
              onClick={onMessage}
              data-ocid={`profile.message.button.${index + 1}`}
              className="flex-1 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              Message
            </Button>
          )}
          {mode === "request" && (
            <>
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isLoading}
                data-ocid={`profile.accept.button.${index + 1}`}
                className="flex-1 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-semibold"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDecline}
                disabled={isLoading}
                data-ocid={`profile.decline.button.${index + 1}`}
                className="flex-1 rounded-full text-xs font-semibold"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Decline
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
