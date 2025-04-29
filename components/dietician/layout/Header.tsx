"use client";

import { useState } from "react";
import { Button } from "@/app/new/dietician/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const getPageTitle = (path: string): string => {
  if (path.endsWith("/dashboard")) return "Dashboard";
  if (path.includes("/consultations")) return "Consultations";
  if (path.includes("/messaging")) return "Messaging";
  if (path.includes("/profile")) return "Profile";
  if (path.includes("/wallet")) return "Wallet";
  // if (path.includes("/settings")) return "Settings";
  return "DietTalk";
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/dietician/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="md:hidden font-medium text-sm">{pageTitle}</div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notification Button (optional) */}
        {/* <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative ml-1 flex items-center gap-2 md:pl-2 md:pr-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image || "/placeholder-avatar.png"}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium">
                  {user?.name || "Dietician"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.type === "dietitian" ? "Dietician" : "User"}
                </span>
              </div>
              <ChevronDown className="hidden h-4 w-4 opacity-50 md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dietician/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dietician/wallet">Wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dietician/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
