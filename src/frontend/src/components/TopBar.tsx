import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

const BACK_ROUTES: Record<string, { label: string; to: string }> = {
  "/setup": { label: "Profile", to: "/profile" },
  "/pending": { label: "Home", to: "/" },
  "/admin": { label: "Discover", to: "/discover" },
};

export default function TopBar() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const router = useRouterState();
  const path = router.location.pathname;

  const backRoute = BACK_ROUTES[path];
  const isLoggedIn = !!identity;

  return (
    <header
      className="sticky top-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 h-14 shrink-0"
      data-ocid="nav.section"
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        {backRoute ? (
          <Link
            to={backRoute.to}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            data-ocid="nav.back.link"
          >
            <ArrowLeft className="w-4 h-4" />
            {backRoute.label}
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
            <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base text-foreground">
              Friend<span className="text-brand-orange">Finder</span>
            </span>
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {isAdmin && isLoggedIn && path !== "/admin" && (
          <Link to="/admin" data-ocid="nav.admin.link">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
          </Link>
        )}
        {!isLoggedIn && (
          <Button
            size="sm"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="nav.login.button"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-5 h-9 text-sm font-semibold"
          >
            Sign Up
          </Button>
        )}
      </div>
    </header>
  );
}
