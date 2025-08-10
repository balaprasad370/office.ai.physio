"use client"

import React, { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/axios"
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react"

type AlertType = "info" | "success" | "warning" | "error"

type DashboardNotification = {
  title: string
  message: string
  type: AlertType
}

const typeToIcon: Record<AlertType, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
}

const typeToAccent: Record<AlertType, string> = {
  info: "text-blue-400 border-blue-500/40",
  success: "text-green-400 border-green-500/40",
  warning: "text-yellow-400 border-yellow-500/40",
  error: "text-red-400 border-red-500/40",
}

const typeToContainer: Record<AlertType, string> = {
  info: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15",
  success: "bg-green-500/10 border-green-500/30 hover:bg-green-500/15",
  warning: "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15",
  error: "bg-red-500/10 border-red-500/30 hover:bg-red-500/15",
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Simple key from content since API has no id
  const getKey = (n: DashboardNotification) => `${n.type}-${n.title}-${n.message}`

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !dismissed.has(getKey(n))),
    [notifications, dismissed]
  )

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const res = await apiClient.get("/accounts/notifications")
        if (res?.data?.status && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications as DashboardNotification[])
        } else {
          setNotifications([])
        }
      } catch (e) {
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const handleDismiss = (n: DashboardNotification) => {
    setDismissed((prev) => new Set(prev).add(getKey(n)))
  }

  if (isLoading) return null
  if (!visibleNotifications.length) return null

  return (
    <div className="space-y-2 sm:space-y-3 mb-3">
      {visibleNotifications.map((n) => (
        <div
          key={getKey(n)}
          role="alert"
          aria-live="polite"
          className={`flex items-start gap-2 sm:gap-3 rounded-xl border p-3 sm:p-4 transition-colors shadow-sm ${typeToContainer[n.type]}`}
        >
          <div className={`mt-0.5 ${typeToAccent[n.type]} rounded-md p-1.5 sm:p-2 border`}>{typeToIcon[n.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <h4 className="text-sm sm:text-base font-semibold text-n-1 flex-1 min-w-0 break-words">{n.title}</h4>
              <button
                aria-label="Dismiss notification"
                onClick={() => handleDismiss(n)}
                className="h-8 w-8 grid place-items-center rounded-md border border-n-6 bg-n-7 text-n-3 hover:bg-n-6 hover:text-n-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-color-1 focus-visible:ring-offset-n-8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-n-3 whitespace-pre-line break-words">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Notifications