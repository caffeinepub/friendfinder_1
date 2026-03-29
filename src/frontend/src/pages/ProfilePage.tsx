import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@tanstack/react-router";
import { Heart, Loader2, LogOut, MapPin, Pencil, Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile } from "../hooks/useQueries";

const GRADIENT_COLORS = [
  "from-orange-400 to-pink-500",
  "from-blue-400 to-indigo-600",
  "from-green-400 to-teal-500",
];

function getGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % GRADIENT_COLORS.length;
  }
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

export default function ProfilePage() {
  const { identity, login, clear } = useInternetIdentity();
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 pt-16">
        <h2 className="font-display font-bold text-2xl text-center">
          Log in to view your profile
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

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center pt-24"
        data-ocid="profile.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 p-8 pt-16 text-center"
        data-ocid="profile.empty_state"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl">No profile yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Create your profile to start discovering friends.
        </p>
        <Button
          onClick={() => router.navigate({ to: "/setup" })}
          data-ocid="profile.setup.button"
          className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12"
        >
          Create Profile
        </Button>
      </div>
    );
  }

  const gradient = getGradient(identity.getPrincipal().toString());

  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <div className="pb-6" data-ocid="profile.section">
      {/* Cover + avatar */}
      <div className={`h-36 bg-gradient-to-r ${gradient} relative`}>
        <Button
          onClick={() => router.navigate({ to: "/setup" })}
          data-ocid="profile.edit.button"
          size="sm"
          className="absolute top-3 right-3 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm h-9 px-3"
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
      </div>

      <div className="px-4">
        <div className="-mt-12 mb-4 flex items-end justify-between">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-card">
            {profile.photo ? (
              <img
                src={profile.photo.getDirectURL()}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <span className="text-white font-display font-bold text-3xl">
                  {profile.displayName?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            )}
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl text-foreground">
          {profile.displayName}
          {profile.age && (
            <span className="font-normal text-xl text-muted-foreground">
              , {profile.age.toString()}
            </span>
          )}
        </h1>

        {profile.city && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {profile.city}
          </div>
        )}

        {profile.bio && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm text-foreground mb-1.5">
              About
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm text-foreground mb-2">
              Interests ({profile.interests.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <Badge
                  key={interest}
                  className="rounded-full bg-brand-orange/10 text-brand-orange border-0 font-medium px-3 text-xs"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => clear()}
          className="w-full mt-6 rounded-full h-11"
          data-ocid="profile.logout.button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with{" "}
            <Heart className="inline w-3 h-3 text-brand-orange fill-brand-orange" />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
