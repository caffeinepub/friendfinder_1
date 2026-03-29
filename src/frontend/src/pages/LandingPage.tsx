import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Shield, Star, Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: MapPin,
    title: "Nearby Friends",
    desc: "Connect with women in your city who share your passions.",
    color: "bg-orange-100 text-brand-orange",
  },
  {
    icon: Heart,
    title: "Shared Interests",
    desc: "Find your people through 150+ interest tags across every hobby.",
    color: "bg-pink-100 text-pink-500",
  },
  {
    icon: Shield,
    title: "Verified & Safe",
    desc: "Every member is manually reviewed before joining.",
    color: "bg-green-100 text-green-600",
  },
];

const testimonials = [
  {
    name: "Priya S.",
    city: "Mumbai",
    quote:
      "Found my hiking group within a week! These girls are my best friends now.",
    gradient: "from-orange-400 to-pink-500",
  },
  {
    name: "Ananya R.",
    city: "Delhi",
    quote:
      "Finally an app where I feel safe meeting new people. Love the verification!",
    gradient: "from-blue-400 to-purple-500",
  },
  {
    name: "Meera K.",
    city: "Bengaluru",
    quote: "Met my coffee date crew and we brunch every Sunday. 10/10!",
    gradient: "from-green-400 to-teal-500",
  },
];

export default function LandingPage() {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (identity) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-8 pt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange to-pink-400 flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Welcome back! 💕
          </h2>
          <p className="text-muted-foreground text-sm">
            Ready to discover new friends?
          </p>
        </div>
        <Link to="/discover">
          <Button
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12 font-semibold"
            data-ocid="landing.discover.button"
          >
            Discover People
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100 px-6 pt-10 pb-10 text-center">
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-orange-200/40 blur-2xl" />
        <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-pink-300/30 blur-2xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-orange-200 rounded-full px-3 py-1.5 mb-5">
            <span className="text-xs font-medium text-brand-orange">
              🇮🇳 Made for women in India
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl text-foreground mb-3 leading-tight">
            Make real friends
            <br />
            <span className="text-brand-orange">who get you</span>
          </h1>

          <p className="text-muted-foreground text-sm leading-relaxed mb-7 max-w-xs mx-auto">
            Connect with women across India based on shared interests. Real
            friendships, verified members, safe community.
          </p>

          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="landing.signup.button"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12 font-semibold text-base w-full max-w-xs"
          >
            {loginStatus === "logging-in"
              ? "Connecting..."
              : "Join FriendFinder Free"}
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            Free to join · Verified & safe
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 py-8">
        <h2 className="font-display font-bold text-xl text-center mb-6">
          How it works
        </h2>
        <div className="space-y-4">
          {[
            "Create your profile",
            "Pick your interests",
            "Discover & connect",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{i + 1}</span>
              </div>
              <span className="font-medium text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-5 pb-8">
        <div className="space-y-3">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-start gap-4 bg-card rounded-2xl p-4 shadow-xs border border-border"
            >
              <div
                className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-5 pb-8">
        <h2 className="font-display font-bold text-xl mb-5 text-center">
          What members say 💬
        </h2>
        <div className="space-y-3">
          {testimonials.map(({ name, city, quote, gradient }) => (
            <div
              key={name}
              className="bg-card rounded-2xl p-4 shadow-xs border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-sm">
                    {name[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {name} · {city}
                  </div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-3 h-3 fill-brand-orange text-brand-orange"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{quote}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5">
        <div className="bg-gradient-to-br from-brand-orange to-pink-500 rounded-2xl p-6 text-center text-white">
          <h3 className="font-display font-bold text-xl mb-2">
            Ready to find your people?
          </h3>
          <p className="text-white/80 text-sm mb-5">
            Join women across India making real connections.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="landing.cta.button"
            className="bg-white text-brand-orange hover:bg-white/90 rounded-full px-8 h-11 font-semibold w-full"
          >
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pt-8 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <Heart className="inline w-3 h-3 text-brand-orange fill-brand-orange" />{" "}
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
