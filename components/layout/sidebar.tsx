"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  User,
  Globe,
  ShoppingCart,
  Plug,
  CreditCard as Payment,
  Mic,
  LogOut,
} from "lucide-react"
import { useState, useEffect } from "react"
import "@/app/dashboard/styles.css"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip"
import { apiClient } from "@/lib/axios"
import {toast} from "sonner"
import  AuthGuard  from '@/components/auth/AuthGuard';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  submenu?: NavItem[]
  group?: string
}

interface UserData {
  first_name: string
  last_name: string
  currency_code: string
  country_code: string
  locale: string
  credits: number
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    group: "Main",
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: <Calendar className="h-5 w-5" />,
    group: "Main",
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: <Calendar className="h-5 w-5" />,
    group: "Main",
  },
  {
    title: "Availability",
    href: "/dashboard/availability",
    icon: <Calendar className="h-5 w-5" />,
    group: "Main",
  },
  {
    title: "Domains",
    href: "/dashboard/domains",
    icon: <Globe className="h-5 w-5" />,
    group: "Management",
  },
  {
    title: "Cart",
    href: "/dashboard/cart",
    icon: <ShoppingCart className="h-5 w-5" />,
    group: "Commerce",
  },
  {
    title: "Integrations",
    href: "/dashboard/integrations",
    icon: <Plug className="h-5 w-5" />,
    group: "System",
  },
  {
    title: "Voice Integration",
    href: "/dashboard/voice",
    icon: <Mic className="h-5 w-5" />,
    group: "System",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    group: "System",
  },
]

const NavItem = ({
  item,
  isCollapsed,
}: {
  item: NavItem
  isCollapsed: boolean
}) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const [userData, setUserData] = useState<UserData | null>(null)

  // Check if current path matches item or any of its submenu items
  const isActive =
    pathname === item.href ||
    (item.submenu?.some(subItem => pathname === subItem.href) ?? false)

  // Auto-expand parent if child route is active
  useEffect(() => {
    if (item.submenu?.some(subItem => pathname === subItem.href)) {
      setIsOpen(true)
    }
  }, [pathname, item.submenu])

  const getData = async () => {
    try {
      const response = await apiClient.get("/profile/getDetails")
      const data = response.data.data
      setUserData(data)
    } catch (error) {
      toast.error("Failed to fetch profile data")
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 my-2 transition-all cursor-pointer",
        "hover:bg-color-1/10 dark:hover:bg-color-1/10",
        "text-gray-300 hover:text-color-1",
        isActive && "bg-color-1/20 text-color-1",
      )}
      onClick={() => {
        if (item.submenu) {
          setIsOpen(!isOpen)
        } else if (item.href) {
          window.location.href = item.href
        }
      }}
    >
      <div
        className={cn(
          "transition-colors",
          isActive ? "text-color-1" : "text-gray-300",
        )}
      >
        {item.icon}
      </div>
      {!isCollapsed && (
        <>
          <span className="font-medium">{item.title}</span>
          {item.submenu && (
            <div className="ml-auto transition-transform">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <div>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent
            side="right"
            className={cn(
              "bg-gray-900 text-white",
              "border border-gray-800",
              "shadow-lg shadow-black/20",
              "text-sm font-medium",
              "px-3 py-1.5",
              "rounded-md",
            )}
          >
            {item.title}
          </TooltipContent>
        </Tooltip>
      ) : (
        content
      )}

      {item.submenu && isOpen && !isCollapsed && (
        <div className="ml-6 mt-2 space-y-1">
          {item.submenu.map(subItem => (
            <NavItem
              key={subItem.href}
              item={subItem}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()
  useEffect(() => {

    const token = localStorage.getItem("token");
    if(!token) return;

    const getData = async () => {
      try {
        const response = await apiClient.get("/profile/getDetails")
        const data = response.data.data
        setUserData(data)
      } catch (error) {
        toast.error("Failed to fetch profile data")
        console.error(error)
      }
    }
    getData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.replace("/login")
  }

  const groupedNavItems = navItems.reduce(
    (acc, item) => {
      const group = item.group || "Other"
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(item)
      return acc
    },
    {} as Record<string, NavItem[]>,
  )

  return (
    <AuthGuard>
    <div className={cn("dashboard-container", className)}>
      <aside
        className={cn(
          "sidebar flex flex-col",
          "bg-gray-900 border-r border-gray-800",
          isCollapsed ? "closed" : "open",
        )}
      >
        <div className="flex h-16 px-2 justify-between items-center border-b border-gray-800 ">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white">
                AI Physio
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "hover:bg-color-1/10",
              "text-gray-300 hover:text-color-1",
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 pt-4 overflow-y-auto custom-scrollbar">
          {Object.entries(groupedNavItems).map(([group, items]) => (
            <div key={group}>
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                  {group}
                </div>
              )}
              {items.map(item => (
                <NavItem
                  key={item.href}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-800">
          {!isCollapsed ? (
            <div className="flex flex-col">
              <div className="flex flex-col p-2 border rounded-lg border-gray-400/20 bg-n-7/30">
                <div className="flex flex-col space-y-2 mb-2 border-b border-n-2 pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-sm text-n-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credits: {userData?.credits}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className={cn(
                        "bg-gray-900 text-white",
                        "border border-gray-800",
                        "shadow-lg shadow-black/20",
                        "text-sm font-medium",
                        "px-3 py-1.5",
                        "rounded-md",
                      )}
                    >
                      Available Credits
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="w-full px-2 py-1.5 text-xs rounded-lg bg-color-1 text-n-1 hover:bg-color-1/90 transition-all duration-200 hover:shadow-md hover:shadow-color-1/20">
                        Buy Credits
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      className={cn(
                        "bg-gray-900 text-white",
                        "border border-gray-800",
                        "shadow-lg shadow-black/20",
                        "text-sm font-medium",
                        "px-3 py-1.5",
                        "rounded-md",
                      )}
                    >
                      Purchase Additional Credits
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex justify-between border-b border-n-2 pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex w-full justify-between items-center ">
                        <div className="flex w-full items-center gap-1.5 text-sm text-n-2">
                          <Payment className="h-4 w-4" />
                          <span className="text-xs text-n-2">
                            {userData?.currency_code}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            router.push("/dashboard/settings")
                          }}
                          className="ml-2 text-xs text-n-2 hover:underline cursor-pointer"
                        >
                          Change currency
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className={cn(
                        "bg-gray-900 text-white",
                        "border border-gray-800",
                        "shadow-lg shadow-black/20",
                        "text-sm font-medium",
                        "px-3 py-1.5",
                        "rounded-md",
                      )}
                    >
                      {userData?.currency_code}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Popover className="relative">
                  <PopoverButton className="w-full">
                    <div className="flex items-center gap-2 pt-2 hover:bg-n-7/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-color-1/20 flex items-center justify-center ring-1 ring-color-1">
                        <span className="text-base font-semibold text-color-1">
                          {userData?.first_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-n-1">
                          {userData?.first_name} {userData?.last_name}
                        </p>
                        <p className="text-xs text-n-3">Administrator</p>
                      </div>
                    </div>
                  </PopoverButton>

                  <PopoverPanel  anchor="top"  className="absolute z-10 w-auto mt-2 bg-n-6 border border-n-2 rounded-lg shadow-lg">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => router.push("/dashboard/settings")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-color-1/10 rounded-lg"
                      >
                        <Settings className="h-4 w-4" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-color-1/10 rounded-lg"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </PopoverPanel>
                </Popover>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center border-b border-gray-800">
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      "hover:bg-color-1/10",
                      "text-gray-300 hover:text-color-1",
                    )}
                  >
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  "bg-gray-900 text-white",
                  "border border-gray-800",
                  "shadow-lg shadow-black/20",
                  "text-sm font-medium",
                  "px-3 py-1.5",
                  "rounded-md",
                )}
              >
                Account Settings
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </div>
    </AuthGuard>
  )
}
