import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, MessageCircle, UserCircle, Users } from "lucide-react";

const tabs = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function BottomTabBar() {
  const router = useRouterState();
  const path = router.location.pathname;

  const isActive = (href: string) =>
    path === href || path.startsWith(`${href}/`);

  return (
    <nav className="bottom-tab-bar" data-ocid="nav.bottom.section">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            to={href}
            data-ocid={`nav.${label.toLowerCase()}.link`}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
              active
                ? "text-brand-orange"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                active ? "stroke-[2.5px]" : "stroke-[1.75px]"
              }`}
            />
            <span
              className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
