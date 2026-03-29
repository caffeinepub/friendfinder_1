import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@tanstack/react-router";
import { Camera, ChevronDown, ChevronRight, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useSaveProfile } from "../hooks/useQueries";

const INTEREST_CATEGORIES = [
  {
    category: "Lifestyle & Wellness",
    emoji: "🧘",
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
    emoji: "⚽",
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
    emoji: "🍳",
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
    emoji: "🎨",
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
    emoji: "🎵",
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
    emoji: "💻",
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
    emoji: "🤝",
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
    emoji: "👗",
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
    emoji: "✨",
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

export default function ProfileSetupPage() {
  const { identity, login } = useInternetIdentity();
  const router = useRouter();
  const { data: existingProfile, isLoading } = useMyProfile();
  const saveProfile = useSaveProfile();
  const { actor } = useActor();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([INTEREST_CATEGORIES[0].category]),
  );

  const isEditing = !!existingProfile;

  useEffect(() => {
    if (existingProfile) {
      setDisplayName(existingProfile.displayName ?? "");
      setBio(existingProfile.bio ?? "");
      setAge(existingProfile.age?.toString() ?? "");
      setCity(existingProfile.city ?? "");
      setSelectedInterests(existingProfile.interests ?? []);
      if (existingProfile.photo) {
        setPhotoPreview(existingProfile.photo.getDirectURL());
      }
    }
  }, [existingProfile]);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 pt-16">
        <h2 className="font-display font-bold text-2xl text-center">
          Please log in first
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

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (!age || Number(age) < 18) {
      toast.error("You must be 18 or older");
      return;
    }
    if (!city.trim()) {
      toast.error("City is required");
      return;
    }
    if (selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (!photoFile && !existingProfile?.photo) {
      toast.error("A profile photo is required");
      return;
    }

    let photo: ExternalBlob | undefined = existingProfile?.photo ?? undefined;

    if (photoFile) {
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      photo = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    }

    try {
      await saveProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        age: BigInt(age),
        city: city.trim(),
        interests: selectedInterests,
        photo,
        gender: "female",
      });

      if (actor) {
        try {
          await actor.requestApproval();
        } catch {
          // Already requested or other non-critical error
        }
      }

      let isApproved = false;
      if (actor) {
        try {
          isApproved = await actor.isCallerApproved();
        } catch {
          isApproved = false;
        }
      }

      toast.success(
        isEditing
          ? "Profile updated!"
          : "Profile created! Welcome to FriendFinder!",
      );

      if (isApproved) {
        router.navigate({ to: "/discover" });
      } else {
        router.navigate({ to: "/pending" });
      }
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center pt-24"
        data-ocid="setup.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  const hasPhoto = !!photoFile || !!existingProfile?.photo;

  return (
    <div className="pb-8 px-4">
      <div className="text-center pt-5 mb-6">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          {isEditing ? "Edit Profile" : "Set Up Your Profile"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEditing
            ? "Update your details below."
            : "Tell people a bit about yourself."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        data-ocid="setup.form"
      >
        {/* Photo upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center ${
                hasPhoto
                  ? "bg-gradient-to-br from-orange-400 to-pink-500"
                  : "bg-gradient-to-br from-orange-400 to-pink-500 ring-2 ring-destructive ring-offset-2"
              }`}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-display font-bold text-3xl">
                  {displayName?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center cursor-pointer hover:bg-brand-orange/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              data-ocid="setup.upload_button"
            />
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="text-xs text-muted-foreground">
              Uploading... {uploadProgress}%
            </div>
          )}
          <p
            className={`text-xs font-medium ${hasPhoto ? "text-muted-foreground" : "text-destructive"}`}
          >
            Profile photo is required{" "}
            <span className="text-destructive">*</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-sm">
              Name *
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="First name"
              data-ocid="setup.displayname.input"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-sm">
              Age *
            </Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              data-ocid="setup.age.input"
              className="h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-sm">
            City *
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Mumbai, Maharashtra"
            data-ocid="setup.city.input"
            className="h-11"
            required
          />
          <p className="text-xs text-muted-foreground">
            Only users in India can join FriendFinder
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-sm">
            About You
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell potential friends a bit about yourself..."
            rows={3}
            data-ocid="setup.bio.textarea"
          />
        </div>

        {/* Interests — categorized & collapsible */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              Interests *{" "}
              <span className="text-muted-foreground font-normal text-xs">
                ({selectedInterests.length} selected, min 3)
              </span>
            </Label>
            {selectedInterests.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedInterests([])}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Selected preview */}
          {selectedInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-3 bg-brand-warm rounded-xl">
              {selectedInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange text-white text-xs font-medium"
                >
                  {interest}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
            {INTEREST_CATEGORIES.map((cat) => {
              const expanded = expandedCategories.has(cat.category);
              const selectedInCat = cat.interests.filter((i) =>
                selectedInterests.includes(i),
              ).length;
              return (
                <div key={cat.category}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.category)}
                    className="w-full flex items-center justify-between px-3 py-3 bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.emoji}</span>
                      <span className="text-sm font-medium">
                        {cat.category}
                      </span>
                      {selectedInCat > 0 && (
                        <span className="text-xs bg-brand-orange text-white rounded-full px-1.5 py-0.5 font-semibold">
                          {selectedInCat}
                        </span>
                      )}
                    </div>
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {expanded && (
                    <div className="px-3 pb-3 pt-2 flex flex-wrap gap-1.5 bg-muted/30">
                      {cat.interests.map((interest) => {
                        const active = selectedInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            data-ocid="setup.interest.toggle"
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[32px] ${
                              active
                                ? "bg-brand-orange text-white"
                                : "bg-card text-muted-foreground border border-border hover:border-brand-orange hover:text-brand-orange"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={saveProfile.isPending}
          data-ocid="setup.submit.button"
          className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full h-13 font-bold text-base"
          style={{ height: "52px" }}
        >
          {saveProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : isEditing ? (
            "Update Profile"
          ) : (
            "Create Profile & Start Discovering"
          )}
        </Button>
      </form>
    </div>
  );
}
