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
  X,
  Menu,
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import "@/app/dashboard/styles.css"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip"
import { apiClient } from "@/lib/axios"
import { toast } from "sonner"
import AuthGuard from "@/components/auth/AuthGuard";

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

// Memoized NavItem component for better performance
const NavItem = memo(({
  item,
  isCollapsed,
  isMobile,
  onItemClick,
}: {
  item: NavItem
  isCollapsed: boolean
  isMobile: boolean
  onItemClick: (href: string) => void
}) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Check if current path matches item or any of its submenu items
  const isActive = useMemo(() => 
    pathname === item.href ||
    (item.submenu?.some(subItem => pathname === subItem.href) ?? false),
    [pathname, item.href, item.submenu]
  )

  // Auto-expand parent if child route is active
  useEffect(() => {
    if (item.submenu?.some(subItem => pathname === subItem.href)) {
      setIsOpen(true)
    }
  }, [pathname, item.submenu])

  const handleClick = useCallback(() => {
    if (item.submenu) {
      setIsOpen(!isOpen)
    } else if (item.href) {
      onItemClick(item.href)
    }
  }, [item.submenu, item.href, isOpen, onItemClick])

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 my-2 transition-all cursor-pointer",
        "hover:bg-color-1/10 dark:hover:bg-color-1/10",
        "text-gray-300 hover:text-color-1",
        isActive && "bg-color-1/20 text-color-1",
        isMobile && "py-3" // Larger touch targets on mobile
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div
        className={cn(
          "transition-colors flex-shrink-0",
          isActive ? "text-color-1" : "text-gray-300",
        )}
      >
        {item.icon}
      </div>
      {!isCollapsed && (
        <>
          <span className="font-medium truncate">{item.title}</span>
          {item.submenu && (
            <div className="ml-auto transition-transform flex-shrink-0">
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
      {isCollapsed && !isMobile ? (
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
              isMobile={isMobile}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  )
})

NavItem.displayName = 'NavItem'

// Mobile Sidebar Component
const MobileSidebar = ({
  isOpen,
  onClose,
  userData,
  isLoading,
  router,
  groupedNavItems,
  handleItemClick,
  sidebarContent
}: {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
  isLoading: boolean
  router: any
  groupedNavItems: Record<string, NavItem[]>
  handleItemClick: (href: string) => void
  sidebarContent: React.ReactNode
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out",
          "bg-gray-900 border-r border-gray-800",
          !isOpen && "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

// Desktop Sidebar Component
const DesktopSidebar = ({
  isCollapsed,
  setIsCollapsed,
  isSidebarVisible,
  sidebarContent
}: {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  isSidebarVisible: boolean
  sidebarContent: React.ReactNode
}) => {
  return (
    <aside
      className={cn(
        "sidebar flex flex-col relative",
        "bg-gray-900 border-r border-gray-800",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "p-4" : "w-64 p-2",
        !isSidebarVisible && "w-0 border-0 opacity-0 pointer-events-none"
      )}
      style={!isSidebarVisible ? { width: 0 } : undefined}
      aria-hidden={!isSidebarVisible}
    >
      {sidebarContent}
    </aside>
  )
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(false)
        setIsMobileOpen(false)
        setIsSidebarVisible(false) // Hide sidebar by default on mobile
      } else {
        setIsSidebarVisible(true) // Show sidebar by default on desktop
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch user data
  useEffect(() => {
  

    const getData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get("/profile/getDetails")
        const data = response.data.data
        setUserData(data)
      } catch (error) {
        toast.error("Failed to fetch profile data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [])

  const sendLogoutRequest = useCallback(async () => {

    try {
      const response = await apiClient.post("/accounts/logout")
      console.log(response)
      if(response.data.status){
        window.location.href = "https://ai.physio"
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const handleLogout = useCallback(() => {
      try{
        sendLogoutRequest()
      }catch(error){
        console.error(error)
      }
    // Keep logout button but remove localStorage and redirect
  }, [])

  const handleItemClick = useCallback((href: string) => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
    router.push(href)
  }, [isMobile, router])

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev)
    } else {
      setIsSidebarVisible(prev => !prev)
    }
  }, [isMobile])

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    } else {
      setIsSidebarVisible(false)
    }
  }, [isMobile])

  const groupedNavItems = useMemo(() => 
    navItems.reduce(
      (acc, item) => {
        const group = item.group || "Other"
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(item)
        return acc
      },
      {} as Record<string, NavItem[]>,
    ),
    []
  )

  useEffect(() => {
  },[isMobile]);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex h-16 px-2 justify-between items-center border-b border-gray-800">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-white">
              AI Physio
            </span>
          </Link>
        )}
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={closeSidebar}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "hover:bg-color-1/10",
                "text-gray-300 hover:text-color-1",
              )}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {!isMobile && (
            <>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "hover:bg-color-1/10",
                  "text-gray-300 hover:text-color-1",
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
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
                isMobile={isMobile}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800">
        {!isCollapsed ? (
          <div className="flex flex-col">
            <div className="flex flex-col p-2 border rounded-lg border-gray-400/20 bg-n-7/30">
              <div className="flex flex-col space-y-2 mb-2 border-b border-n-2 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-sm text-n-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Credits: {isLoading ? "..." : userData?.credits || 0}</span>
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
                          {userData?.currency_code || "USD"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          router.push("/dashboard/settings")
                          if (isMobile) setIsMobileOpen(false)
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
                    {userData?.currency_code || "USD"}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="pt-2">
                <div 
                  onClick={() => {
                    router.push("/dashboard/settings")
                    if (isMobile) setIsMobileOpen(false)
                  }}
                  className="flex items-center gap-2 hover:bg-n-7/50 transition-colors cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-color-1/20 flex items-center justify-center ring-1 ring-color-1">
                    <span className="text-base font-semibold text-color-1">
                      {userData?.first_name?.[0] || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-n-1">
                      {userData?.first_name && userData?.last_name 
                        ? `${userData.first_name} ${userData.last_name}`
                        : "User"
                      }
                    </p>
                    <p className="text-xs text-n-3">Administrator</p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      router.push("/dashboard/settings")
                      if (isMobile) setIsMobileOpen(false)
                    }}
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
              </div>
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
    </>
  )

  return (
      <AuthGuard>
      <div className={cn("dashboard-container", className)}>
        {/* Conditionally render mobile or desktop sidebar */}
        {isMobile ? (
          <MobileSidebar
            isOpen={isMobileOpen}
            onClose={() => setIsMobileOpen(false)}
            userData={userData}
            isLoading={isLoading}
            router={router}
            groupedNavItems={groupedNavItems}
            handleItemClick={handleItemClick}
            sidebarContent={sidebarContent}
          />
        ) : (
          <DesktopSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isSidebarVisible={isSidebarVisible}
            sidebarContent={sidebarContent}
          />
        )}

        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={cn(
              "fixed top-4 left-4 z-30 p-2 rounded-lg",
              "bg-gray-900 border border-gray-800",
              "text-gray-300 hover:text-color-1",
              "transition-colors duration-200",
              "lg:hidden"
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Desktop menu button */}
        {!isMobile && !isSidebarVisible && (
          <button
            onClick={toggleSidebar}
            className={cn(
              "fixed top-4 left-4 z-30 p-2 rounded-lg",
              "bg-gray-900 border border-gray-800",
              "text-gray-300 hover:text-color-1",
              "transition-colors duration-200",
              "hidden lg:block"
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
      </AuthGuard>
  
  )
}
