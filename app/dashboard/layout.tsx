import React from "react"
import type { Metadata } from "next"
import Sidebar from "@/components/layout/sidebar"

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Scheduler | AI Agentic Scheduler",
  description: "AI Scheduler | AI Agentic Scheduler",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  )
}
