"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  User,
  Wallet,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/app/new/dietician/ui/button";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth(); // Destructure needed values

  // If not authenticated, return null or hide sidebar
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext instead of local implementation
    router.push("/dietician/login");
  };

  const links = [
    { href: "/dietician/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dietician/consultations", icon: Calendar, label: "Consultations" },
    { href: "/dietician/messaging", icon: MessageSquare, label: "Messaging" },
    { href: "/dietician/profile", icon: User, label: "Profile" },
    { href: "/dietician/wallet", icon: Wallet, label: "Wallet" },
  ];

  return (
    <aside
      className={cn(
        "fixed z-50 flex h-full w-64 flex-col bg-card transition-all lg:relative lg:z-auto",
        isOpen ? "left-0" : "-left-64 lg:left-0"
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dietician/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
            Nutrifood
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 lg:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-purple-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}