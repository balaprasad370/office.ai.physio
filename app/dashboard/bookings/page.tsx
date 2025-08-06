"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UpcomingBookings from "@/components/sections/dashboard/bookings/upcoming"
import PastBookings from "@/components/sections/dashboard/bookings/past"
import CancelledBookings from "@/components/sections/dashboard/bookings/cancelled"
import RescheduledBookings from "@/components/sections/dashboard/bookings/rescheduled"
import { CalendarDaysIcon, ClockIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: <CalendarDaysIcon className="w-4 h-4" /> },
    { id: 'past', label: 'Past', icon: <ClockIcon className="w-4 h-4" /> },
    { id: 'cancelled', label: 'Cancelled', icon: <XCircleIcon className="w-4 h-4" /> },
    { id: 'rescheduled', label: 'Rescheduled', icon: <ArrowPathIcon className="w-4 h-4" /> },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return <UpcomingBookings />
      case 'past':
        return <PastBookings />
      case 'cancelled':
        return <CancelledBookings />
      case 'rescheduled':
        return <RescheduledBookings />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-color-1"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 lg:p-12 p-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id 
                ? "bg-color-1 text-n-1 shadow-sm"
                : "bg-n-8 text-n-3 hover:bg-n-7 hover:text-n-2 border border-n-12"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-n-12 bg-n-7">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-n-12">
          <h3 className="text-sm font-medium text-n-1">
            {tabs.find(tab => tab.id === activeTab)?.icon}
          </h3>
          <span className="text-sm font-medium text-n-1">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-color-4/10 text-color-4 border border-color-4/20">
            Active
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Bookings
