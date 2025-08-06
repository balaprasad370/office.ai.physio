"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import moment from "moment"
import { apiClient } from "@/lib/axios"
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon as HistoryIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline"

interface BookingDetails {
  booking_id: number
  user_full_name: string
  user_email: string
  start_time: string
  end_time: string
  timezone: string
  amount: string
  amount_status: number
  conference_room: string
  user_additional_information: string
  status: number
  booking_created_date: string
}

const BookingDetails = () => {
  const params = useParams()
  const router = useRouter()
  const [eventDetails, setEventDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const getEventStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-color-4/10 text-color-4 border border-color-4/20"
      case 2:
        return "bg-color-2/10 text-color-2 border border-color-2/20"
      case 3:
        return "bg-color-3/10 text-color-3 border border-color-3/20"
      default:
        return "bg-n-3/10 text-n-3 border border-n-3/20"
    }
  }

  const getEventStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Confirmed"
      case 2:
        return "Cancelled"
      case 3:
        return "Rescheduled"
      default:
        return "Unknown"
    }
  }

  const isEventExpired = () => {
    if (!eventDetails) return false
    const now = moment()
    const eventDate = moment(eventDetails.end_time)
    return now.isAfter(eventDate)
  }

  useEffect(() => {
    const getEventData = async () => {
      try {
        const response = await apiClient.get(`/v1/event/${params.booking_id}`)
    
        if (response.data.status) {
          setEventDetails(response.data.data[0])
        }
      } catch (error) {
        console.error("Error fetching event details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.booking_id) {
      getEventData()
    }
  }, [params.booking_id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-1"></div>
      </div>
    )
  }

  if (!eventDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-n-1">Booking not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-12">
      {/* Header Section */}
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl border border-n-12 bg-n-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-n-1">Booking Details</h1>
            <p className="mt-1 text-n-3">Booking ID: {eventDetails.booking_id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isEventExpired() ? (
              <span className="px-3 py-2 text-sm font-medium rounded-full bg-color-2/10 text-color-2 border border-color-2/20">
                Expired
              </span>
            ) : (
              <span className={`px-3 py-2 text-sm font-medium rounded-full ${getEventStatusColor(eventDetails.status)}`}>
                {getEventStatusText(eventDetails.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-8">
          {/* Time and Location */}
          <div className="p-6 rounded-xl border border-n-12 bg-n-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-n-1 mb-4">
                  <CalendarDaysIcon className="w-5 h-5 text-color-1" />
                  Date & Time
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-color-1/10">
                      <CalendarDaysIcon className="w-5 h-5 text-color-1" />
                    </div>
                    <div>
                      <p className="text-sm text-n-3">Date</p>
                      <p className="font-medium text-n-1">
                        {moment(eventDetails.start_time).format("MMMM D, YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-color-1/10">
                      <ClockIcon className="w-5 h-5 text-color-1" />
                    </div>
                    <div>
                      <p className="text-sm text-n-3">Time</p>
                      <p className="font-medium text-n-1">
                        {moment(eventDetails.start_time).format("hh:mm A")} - {moment(eventDetails.end_time).format("hh:mm A")}
                      </p>
                      <p className="text-sm text-n-3">{eventDetails.timezone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {eventDetails.conference_room && (
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-n-1 mb-4">
                    <MapPinIcon className="w-5 h-5 text-color-1" />
                    Meeting Link
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-color-1/10">
                      <VideoCameraIcon className="w-5 h-5 text-color-1" />
                    </div>
                    <div>
                      <p className="font-medium text-n-1">Video Conference</p>
                      <a
                        href={eventDetails.conference_room}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-n-1 bg-color-1 rounded-lg hover:bg-color-1/80 transition-colors"
                      >
                        <VideoCameraIcon className="w-4 h-4" />
                        Join Meeting
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="p-6 rounded-xl border border-n-12 bg-n-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-n-1 mb-4">
              <DocumentTextIcon className="w-5 h-5 text-color-1" />
              Additional Notes
            </h2>
            <div className="p-4 rounded-lg bg-n-8">
              <p className="text-n-2 whitespace-pre-wrap">
                {eventDetails.user_additional_information || "No additional notes"}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          {/* Customer Information */}
          <div className="p-6 rounded-xl border border-n-12 bg-n-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-n-1 mb-4">
              <UserCircleIcon className="w-5 h-5 text-color-1" />
              Customer Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-color-1/10">
                  <UserCircleIcon className="w-5 h-5 text-color-1" />
                </div>
                <div>
                  <p className="text-sm text-n-3">Name</p>
                  <p className="font-medium text-n-1">{eventDetails.user_full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-color-1/10">
                  <EnvelopeIcon className="w-5 h-5 text-color-1" />
                </div>
                <div>
                  <p className="text-sm text-n-3">Email</p>
                  <p className="font-medium text-n-1">{eventDetails.user_email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="p-6 rounded-xl border border-n-12 bg-n-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-n-1 mb-4">
              <CurrencyDollarIcon className="w-5 h-5 text-color-1" />
              Payment Details
            </h2>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-color-1/10">
                <CurrencyDollarIcon className="w-5 h-5 text-color-1" />
              </div>
              <div>
                <p className="text-sm text-n-3">Amount</p>
                <p className="font-medium text-n-1">${eventDetails.amount}</p>
                <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  eventDetails.amount_status === 1
                    ? "bg-color-4/10 text-color-4 border border-color-4/20"
                    : "bg-color-2/10 text-color-2 border border-color-2/20"
                }`}>
                  {eventDetails.amount_status === 1 ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 rounded-xl border border-n-12 bg-n-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-n-1 mb-4">
              <HistoryIcon className="w-5 h-5 text-color-1" />
              Timeline
            </h2>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-color-1/10">
                <HistoryIcon className="w-5 h-5 text-color-1" />
              </div>
              <div>
                <p className="text-sm text-n-3">Created</p>
                <p className="font-medium text-n-1">
                  {moment(eventDetails.booking_created_date).format("MMMM D, YYYY h:mm A")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails