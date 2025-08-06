"use client"

import React from "react"
import { PhoneIcon, ClockIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

const Voice = () => {
  const router = useRouter()
  
  const voiceStats = {
    status: "Active",
    totalCalls: 156,
    totalBookings: 42,
    activeNumbers: ["(555) 123-4567", "(555) 987-6543"],
  }

  const recentCalls = [
    {
      id: 1,
      caller: "(555) 111-2222", 
      duration: "12:30",
      time: "Today, 2:00 PM",
      type: "Booking Call",
    },
    {
      id: 2,
      caller: "(555) 333-4444",
      duration: "08:45", 
      time: "Today, 11:30 AM",
      type: "Information",
    }
  ]

  return (
    <div className="flex flex-col gap-2 border border-n-12 rounded-lg p-2 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-n-1">Voice Agent</h2>
          <p className="text-n-3 text-xs">AI Voice Assistant Status</p>
        </div>
        <button onClick={() => router.push("/dashboard/voice")} className="px-2 py-1 text-xs font-medium text-n-1 bg-color-1 rounded-md hover:bg-opacity-50">Configure</button>
      </div>

      {voiceStats.status === "Not Active" ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 rounded-lg border border-n-12 bg-n-7">
          <PhoneIcon className="w-8 h-8 text-color-1 mb-2" />
          <h3 className="text-base font-medium text-n-1 mb-1">Voice Agent Not Active</h3>
          <button onClick={() => router.push("/dashboard/voice")} className="px-3 py-1.5 text-sm text-n-1 bg-color-1 rounded-md">Activate</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg border border-n-12 bg-n-7">
              <div className="flex items-center gap-1 mb-1">
                <div className={`w-2 h-2 rounded-full ${voiceStats.status === "Active" ? "bg-color-4" : "bg-color-2"}`} />
                <span className="text-xs text-n-1">Status: {voiceStats.status}</span>
              </div>
              <div className="text-xl font-bold text-n-1">{voiceStats.totalCalls}</div>
              <div className="text-xs text-n-3">Total Calls</div>
            </div>

            <div className="p-2 rounded-lg border border-n-12 bg-n-7">
              <div className="text-xl font-bold text-n-1">{voiceStats.totalBookings}</div>
              <div className="text-xs text-n-3">Bookings</div>
            </div>
          </div>

          <div className="p-2 rounded-lg border border-n-12 bg-n-7">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-n-1">Active Numbers</div>
              <button onClick={() => router.push("/dashboard/voice/numbers")} className="text-xs text-color-1 hover:underline hover:underline-offset-4 hover:text-color-1/90">Manage</button>
            </div>
            {voiceStats.activeNumbers.map((number, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-n-2">
                <PhoneIcon className="w-3 h-3 text-n-3" />
                {number}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-n-1">Recent Calls</div>
              <button onClick={() => router.push("/dashboard/voice/calls")} className="text-xs text-color-1 hover:underline hover:underline-offset-4 hover:text-color-1/90">View All</button>
            </div>

            {recentCalls.map(call => (
              <div key={call.id} className="p-2 rounded-lg border border-n-12 bg-n-7">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-3 h-3 text-color-1" />
                    <span className="text-xs text-n-1">{call.caller}</span>
                  </div>
                  <span className="text-[10px] text-n-3">{call.type}</span>
                </div>
                <div className="flex gap-2 text-[10px] text-n-2">
                  <span>{call.duration}</span>
                  <span>{call.time}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Voice
