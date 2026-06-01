"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCalendarEvent, IconTrophy, IconUser } from "@tabler/icons-react";

const tabs = [
  { href: "/", label: "Séances", icon: IconCalendarEvent },
  { href: "/records", label: "Records", icon: IconTrophy },
  { href: "/profil", label: "Profil", icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border max-w-md mx-auto">
      <div className="flex items-center justify-around h-full">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
