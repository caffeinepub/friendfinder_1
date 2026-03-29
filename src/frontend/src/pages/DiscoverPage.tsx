import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@tanstack/react-router";
import { Clock, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProfileCard from "../components/ProfileCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFindByInterest,
  useIsApproved,
  useMyProfile,
} from "../hooks/useQueries";

const INTEREST_CATEGORIES = [
  {
    category: "Lifestyle & Wellness",
    interests: [
      "Yoga",
      "Meditation",
      "Fitness",
      "Running",
      "Pilates",
      "Hiking",
      "Cycling",
      "Swimming",
      "Rock Climbing",
      "Martial Arts",
      "Wellness",
      "Journaling",
      "Self-Care",
      "Skincare",
      "Mental Health",
      "Therapy",
      "Nutrition",
      "Sleep",
      "Herbalism",
      "Breathwork",
    ],
  },
  {
    category: "Sports & Outdoors",
    interests: [
      "Volleyball",
      "Tennis",
      "Basketball",
      "Soccer",
      "Golf",
      "Skiing",
      "Snowboarding",
      "Surfing",
      "Skateboarding",
      "Roller Skating",
      "Archery",
      "Horseback Riding",
      "Boxing",
      "Dance Fitness",
      "Travel",
      "Camping",
      "Beach",
      "Road Trips",
      "Backpacking",
      "Birdwatching",
      "Astronomy",
      "Gardening",
      "Outdoors",
    ],
  },
  {
    category: "Food & Drink",
    interests: [
      "Cooking",
      "Baking",
      "Coffee",
      "Tea",
      "Wine",
      "Food",
      "Vegan Food",
      "Brunch",
      "Meal Prep",
      "Sushi",
      "Wine Tasting",
      "Cocktails",
      "Food Photography",
      "Fermentation",
      "Veganism",
      "Gluten-Free",
      "Street Food",
      "Fine Dining",
      "Meal Kits",
    ],
  },
  {
    category: "Arts & Culture",
    interests: [
      "Art",
      "Drawing",
      "Painting",
      "Photography",
      "Film",
      "Movies",
      "Theatre",
      "Museums",
      "Writing",
      "Poetry",
      "Design",
      "Crafts",
      "Knitting",
      "DIY",
      "Ceramics",
      "Sculpting",
      "Calligraphy",
      "Street Art",
      "Interior Design",
      "Fashion Design",
      "Comic Books",
      "Webtoons",
      "Illustration",
    ],
  },
  {
    category: "Music & Entertainment",
    interests: [
      "Music",
      "Dancing",
      "Concerts",
      "K-Pop",
      "Jazz",
      "Classical Music",
      "Karaoke",
      "Live Music",
      "Musical Theatre",
      "K-Dramas",
      "Documentaries",
      "Stand-Up Comedy",
      "Improv",
      "Escape Rooms",
      "Reality TV",
      "True Crime",
      "Podcasts",
    ],
  },
  {
    category: "Tech & Gaming",
    interests: [
      "Technology",
      "Gaming",
      "Board Games",
      "Coding",
      "Anime",
      "Manga",
      "AI / Machine Learning",
      "Crypto",
      "Web3",
      "UX Design",
      "3D Printing",
      "Smart Homes",
      "Robotics",
      "App Development",
    ],
  },
  {
    category: "Social & Community",
    interests: [
      "Volunteering",
      "Activism",
      "Book Clubs",
      "Language Learning",
      "Networking",
      "Parenting",
      "Spirituality",
      "Faith",
      "Debate Club",
      "Mentorship",
      "Study Groups",
      "Community Service",
      "Environmental Causes",
      "Animal Welfare",
      "Feminism",
    ],
  },
  {
    category: "Fashion & Beauty",
    interests: [
      "Fashion",
      "Thrifting",
      "Makeup",
      "Nails",
      "Hair",
      "Vintage Fashion",
      "Sustainable Fashion",
      "Skincare Routines",
      "Nail Art",
      "Hair Styling",
    ],
  },
  {
    category: "Lifestyle & Identity",
    interests: [
      "Reading",
      "Sports",
      "Pets",
      "Astrology",
      "Tarot",
      "Entrepreneurship",
      "Investing",
      "Minimalism",
      "Sustainability",
      "Zero Waste",
      "Vintage",
      "Plant-Based Living",
      "Solo Travel",
      "Digital Nomad",
      "Work-Life Balance",
    ],
  },
];

export const ALL_INTERESTS = INTEREST_CATEGORIES.flatMap((c) => c.interests);

const RADIUS_OPTIONS = [
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "500 km", value: 500 },
  { label: "Any", value: 0 },
];

export default function DiscoverPage() {
  const { identity, login } = useInternetIdentity();
  const router = useRouter();
  const { data: myProfile, isLoading: profileLoading } = useMyProfile();
  const { data: isApproved, isLoading: approvalLoading } = useIsApproved();
  const [activeInterest, setActiveInterest] = useState("Yoga");
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(50);
  const { data: profiles, isLoading } = useFindByInterest(activeInterest);

  if (!identity) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 p-8 pt-16"
        data-ocid="discover.auth.section"
      >
        <h2 className="font-display font-bold text-2xl text-center">
          Log in to discover people
        </h2>
        <Button
          onClick={() => login()}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12"
        >
          Log In to Discover
        </Button>
      </div>
    );
  }

  if (profileLoading || approvalLoading) {
    return (
      <div
        className="flex items-center justify-center pt-24"
        data-ocid="discover.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!myProfile) {
    router.navigate({ to: "/setup" });
    return null;
  }

  if (!isApproved) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 p-8 pt-16 text-center"
        data-ocid="discover.pending.section"
      >
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          Verification Pending
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your profile is under review. You'll be able to discover members once
          approved.
        </p>
        <Button
          variant="outline"
          onClick={() => router.navigate({ to: "/pending" })}
          className="rounded-full"
          data-ocid="discover.pending.button"
        >
          View Verification Status
        </Button>
      </div>
    );
  }

  const applyRadiusFilter = (profileList: typeof profiles) => {
    if (!profileList) return [];
    if (radiusKm === 0) return profileList;
    if (radiusKm <= 25) {
      // Strict city match
      return profileList.filter(
        (p) =>
          p.city.toLowerCase().trim() ===
          (myProfile.city ?? "").toLowerCase().trim(),
      );
    }
    // For 50–500 km, show all (no GPS available)
    return profileList;
  };

  const filtered =
    applyRadiusFilter(profiles)?.filter(
      (p) =>
        !searchQuery ||
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display font-bold text-2xl text-foreground mb-0.5">
          Discover
        </h1>
        <p className="text-muted-foreground text-sm">
          Find friends who share your passions
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or city..."
            className="pl-9 rounded-full h-11"
            data-ocid="discover.search_input"
          />
        </div>
      </div>

      {/* Radius filter */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Find friends within
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRadiusKm(opt.value)}
              data-ocid="discover.radius.toggle"
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                radiusKm === opt.value
                  ? "bg-brand-orange text-white"
                  : "bg-card border border-border text-muted-foreground hover:border-brand-orange hover:text-brand-orange"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {radiusKm !== 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">
            📍 Radius filtering is based on city matching
          </p>
        )}
      </div>

      {/* Category sections with horizontal scroll */}
      <div className="mb-3">
        {INTEREST_CATEGORIES.map((cat) => (
          <div key={cat.category} className="mb-3">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {cat.category}
            </p>
            <div
              className="flex gap-2 overflow-x-auto px-4 pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {cat.interests.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => setActiveInterest(interest)}
                  data-ocid="discover.interest.tab"
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                    activeInterest === interest
                      ? "bg-brand-orange text-white"
                      : "bg-card border border-border text-muted-foreground hover:border-brand-orange hover:text-brand-orange"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="px-4">
        <p className="text-xs text-muted-foreground mb-3">
          Showing people interested in{" "}
          <span className="font-semibold text-foreground">
            {activeInterest}
          </span>
          {radiusKm !== 0 && (
            <span className="text-muted-foreground"> within {radiusKm} km</span>
          )}
        </p>
        {isLoading ? (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="discover.loading_state"
          >
            {["d1", "d2", "d3", "d4"].map((skId) => (
              <div
                key={skId}
                className="bg-card rounded-2xl overflow-hidden shadow-card"
              >
                <Skeleton className="h-40 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="discover.empty_state"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground mb-1.5">
              No people found
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {radiusKm !== 0 && radiusKm <= 25
                ? "No one with this interest in your city yet. Try a wider radius!"
                : "No one with this interest yet. Be the first!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((profile, i) => (
              <ProfileCard
                key={`${profile.displayName}-${profile.city}-${i}`}
                profile={profile}
                mode="discover"
                index={i}
                isVerified
                onConnect={async () => {
                  toast.info("Use the Friends page for connections.");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
