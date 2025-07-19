"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  RotateCcw,
  Users,
  Target,
  Plus,
  Home,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import Image from "next/image";

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: CreditCard, label: "Cashflows", href: "/cashflows" },
  { icon: RotateCcw, label: "Recurring Items", href: "/recurring" },
  { icon: Users, label: "Friends", href: "/friends" },
  { icon: Target, label: "Goals", href: "/goals" },
];

interface Profile {
  name?: string;
  username?: string;
  avatar?: string;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "appSidebarCollapsed",
    false
  );
  const [profile, setProfile] = useState<Profile | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    async function fetchProfile() {
      try {
        const response = await fetch("https://fireflow-m0z1.onrender.com/api/users", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        setProfile(null);
      }
    }
    fetchProfile();
  }, []);

  const handleAddExpense = () => {
    router.push("/cashflows?openForm=expense");
  };

  const handleAddIncome = () => {
    router.push("/cashflows?openForm=income");
  };

  async function handleLogout() {
    try {
      await fetch("https://fireflow-m0z1.onrender.com/login/logout", {
        credentials: "include",
      });
      localStorage.removeItem("authToken");
      document.cookie = "token=; path=/; max-age=0"; // Clear cookie
      router.push("/login");
    } catch (err) {
      alert("Failed to log out.");
    }
  }

  // Helper: get initials from name or username
  function getInitials(name?: string, username?: string): string {
    if (name && name.trim().length > 0) {
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }
    if (username && username.trim().length > 0) {
      return username.slice(0, 2).toUpperCase();
    }
    return "??";
  }

  return (
    <div
      className={`border-r border-orange-600 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? "w-[80px]" : "w-[280px]"
      }`}
    >
      {/* Header */}
      <div className="bg-orange-200 p-6 pb-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {!isCollapsed && (
              <Image
                src="/Fireflow.svg"
                alt="FireFlow Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            )}
            {!isCollapsed && (
              <span className="font-bold text-sm text-orange-900">
                FireFlow
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition-colors duration-150 shadow-sm"
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        <hr className="border-orange-300 my-2 p-1" />
        <Link
          href="/profile"
          className="flex items-center gap-3 cursor-pointer hover:bg-orange-100 rounded-md p-2 transition"
        >
          {isCollapsed ? (
            <Avatar className="w-7 h-7 flex-shrink-0 mx-auto">
              <AvatarImage src={profile?.avatar || "/placeholder.svg?height=48&width=48"} />
              <AvatarFallback className="text-xs bg-gray-300">
                {getInitials(profile?.name, profile?.username)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <>
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={profile?.avatar || "/placeholder.svg?height=48&width=48"} />
                <AvatarFallback className="bg-gray-300">
                  {getInitials(profile?.name, profile?.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-800">
                  {profile?.name || ""}
                </div>
                <div className="text-sm text-gray-600">
                  {profile?.username || ""}
                </div>
              </div>
            </>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="bg-orange-200 p-4 pt-2 flex-1">
        <div className="space-y-2">
          {navigationItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.label} className="group">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-300 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                      : "text-gray-700 hover:bg-orange-100"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
                {/* Render Logout button right after Login */}
                {item.label === "Goals" && (
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-300 w-full mt-1 ${
                      isCollapsed
                        ? "justify-center"
                        : "text-red-600 hover:bg-red-50 font-medium text-sm"
                    }`}
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-orange-200 p-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <Button
              onClick={handleAddExpense}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Expense
            </Button>
            <Button
              onClick={handleAddIncome}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Income
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAddExpense}
              className=" text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddIncome}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
