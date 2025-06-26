"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  RotateCcw,
  Users,
  Target,
  Plus,
  Home,
  Menu,
  ChevronLeft,
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
  { icon: Target, label: "Login", href: "/login" },
  { icon: Target, label: "Sign Up", href: "/signup" },
];

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
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

  const pathname = usePathname();
  const router = useRouter();

  const handleAddExpense = () => {
    router.push("/cashflows?openForm=expense");
  };

  const handleAddIncome = () => {
    router.push("/cashflows?openForm=income");
  };

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
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <Avatar className="w-7 h-7 flex-shrink-0 mx-auto">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="text-xs bg-gray-300">
                BS
              </AvatarFallback>
            </Avatar>
          ) : (
            <>
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-gray-300">BS</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-800">Ben Shin</div>
                <div className="text-sm text-gray-600">Buff Man</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-orange-200 p-4 pt-2 flex-1">
        <div className="space-y-2">
          {navigationItems.map((item) => {
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
