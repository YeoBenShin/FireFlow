"use client"

import { CreditCard, RotateCcw, Users, Target, Plus, Home } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar"
import Image from "next/image"

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/", active: false },
  { icon: CreditCard, label: "Cashflows", href: "/cashflows", active: false },
  { icon: RotateCcw, label: "Recurring Items", href: "/recurring", active: false },
  { icon: Users, label: "Friends", href: "/friends", active: false },
  { icon: Target, label: "Goals", href: "/goals", active: false },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleAddExpense = () => {
    // Navigate to cashflows page with query param to open expense form
    router.push("/cashflows?openForm=expense")
  }

  const handleAddIncome = () => {
    // Navigate to cashflows page with query param to open income form
    router.push("/cashflows?openForm=income")
  }

  return (
    <Sidebar className="border-r border-orange-600">
      <SidebarHeader className="bg-orange-200 p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
           <Image
            src="/Fireflow.svg" alt="FireFlow Logo" width={48} height={48} className="object-contain"
          />
          <span className="font-bold text-lg">FireFlow</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/placeholder.svg?height=48&width=48" />
            <AvatarFallback className="bg-gray-300">BS</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-800">Ben Shin</div>
            <div className="text-sm text-gray-600">Buff Man</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-orange-200 p-6 pt-0">
        {/* Navigation */}
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 ${
                      isActive ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-orange-200 p-6">
        {/* Action Buttons - Now navigate to cashflows page */}
        <div className="space-y-3">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={handleAddExpense}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Expense
          </Button>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={handleAddIncome}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Income
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
