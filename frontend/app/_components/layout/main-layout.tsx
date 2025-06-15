import type React from "react"
import { SidebarProvider } from "@/app/_components/ui/sidebar"
import { AppSidebar } from "../app-sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-orange-50 flex">
        <AppSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </SidebarProvider>
  )
}

// Also export as default for compatibility
export default MainLayout
