"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  User,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

export default function MobileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleLogout = () => {
    // Clear authentication token
    localStorage.removeItem("dietician_token");
    // Redirect to login

    
    router.push("/dietician/login");
  };

  const links = [
    { href: "/dietician/dashboard", icon: LayoutDashboard },
    { href: "/dietician/consultations", icon: Calendar },
    { href: "/dietician/messaging", icon: MessageSquare },
    { href: "/dietician/profile", icon: User },
    { href: "/dietician/wallet", icon: Wallet },
    // { href: "/dietician/settings", icon: Settings },
  ];

  // Don't show the bottom nav on login/signup pages
  if (pathname.includes("/login") || pathname.includes("/signup")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t bg-background p-2 lg:hidden">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex flex-col items-center justify-center rounded-md p-2 text-xs",
            pathname === link.href
              ? "text-purple-600"
              : "text-muted-foreground"
          )}
        >
          <link.icon className="mb-1 h-5 w-5" />
        </Link>
      ))}
    </nav>
  );
}