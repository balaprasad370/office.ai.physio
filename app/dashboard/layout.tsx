"use client"

import React, { useEffect, useState } from "react"
import type { Metadata } from "next"
import Sidebar from "@/components/layout/sidebar"
import apiClient from "@/lib/axios/apiClient"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.post("/accounts/authorize")
        if (response.data.status) {
          setIsAuthenticated(true)
          // Check user status after authentication
          try {
            const userStatus = await apiClient.get("/accounts/status")
            console.log("userStatus", userStatus.data)
            if (!userStatus.data.obj.onboardingStatus) {
              setShowOnboarding(true)
              router.push("/onboarding")
            }
          } catch (error) {
            setShowOnboarding(false)
          }
        } else {
          setIsAuthenticated(false)
          window.location.href = "https://ai.physio"
        }
      } catch (error) {
        setIsAuthenticated(false)
        window.location.href = "https://ai.physio"
      }
    }
    checkAuth()
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (showOnboarding) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  )
}
