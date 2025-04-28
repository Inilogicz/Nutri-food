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
      <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
  <Link
    href="/dietician/dashboard"
    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
  >
    <img 
      src="/fulllogo.png" 
      alt="Diettalk logo"
      className="h-8 w-auto object-contain" // Adjusted sizing
    />
    
  </Link>
  
  <Button
    variant="ghost"
    size="icon"
    className="lg:hidden text-gray-500 hover:bg-transparent hover:text-gray-700"
    onClick={onClose}
  >
    <X className="h-5 w-5" /> {/* Slightly larger icon */}
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