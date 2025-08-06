"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/axios"
import moment from "moment"
import {
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  TrashIcon,
  PhoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"

interface Booking {
  booking_id: number
  user_full_name: string
  user_email: string
  user_mobile: string
  start_time: string
  end_time: string
  timezone: string
  amount: string
  amount_status: number
  conference_room: string
  user_additional_information: string
  status: number
  domain: string
}

const UpcomingBookings = () => {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    handleGetBookings("upcoming")
  }, [])

  const handleGetBookings = async (tab: string) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/v1/schedule/getBookings/${tab}`)
      if (response.data.status) {
        setBookings(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(id)
    setShowConfirmDelete(true)
  }

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        // Add API call to delete booking here
        setBookings(
          bookings.filter(booking => booking.booking_id !== deletingId),
        )
      } catch (error) {
        console.error("Error deleting booking:", error)
      } finally {
        setShowConfirmDelete(false)
        setDeletingId(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-1"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-n-7 rounded-lg border border-n-12">
          <CalendarDaysIcon className="w-16 h-16 text-n-3 mb-3" />
          <p className="text-n-3 font-medium text-center">No upcoming bookings</p>
          <p className="text-n-4 text-sm mt-1 text-center px-4">
            Your scheduled appointments will appear here
          </p>
        </div>
      ) : (
        bookings.map(booking => (
          <div
            key={booking.booking_id}
            className="p-4 sm:p-5 rounded-xl border border-n-12 bg-n-7 relative hover:border-color-1 transition-all cursor-pointer"
            onClick={() =>
              router.push(`/dashboard/bookings/${booking.booking_id}`)
            }
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-color-1/10 flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-color-1" />
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-n-1 mb-1">
                  {booking.user_full_name}
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-n-3">
                  <span className="flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    {booking.user_mobile}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{booking.user_email}</span>
                </div>
              </div>

              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <span
                  className={`w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded-full inline-block text-center ${
                    booking.amount_status === 1
                      ? "bg-color-4/10 text-color-4 border border-color-4/20"
                      : "bg-color-2/10 text-color-2 border border-color-2/20"
                  }`}
                >
                  ${booking.amount} -{" "}
                  {booking.amount_status === 1 ? "Paid" : "Pending"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-n-2">
                <ClockIcon className="w-4 h-4 text-n-3 flex-shrink-0" />
                <span>
                  {moment(booking.start_time).format("hh:mm A")} -{" "}
                  {moment(booking.end_time).format("hh:mm A")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-n-2">
                <CalendarDaysIcon className="w-4 h-4 text-n-3 flex-shrink-0" />
                <span>{moment(booking.start_time).format("MMM D, YYYY")}</span>
              </div>

              <div className="flex items-center gap-2 text-n-2">
                <GlobeAltIcon className="w-4 h-4 text-n-3 flex-shrink-0" />
                <span>{booking.timezone}</span>
              </div>

              {booking.conference_room && (
                <a
                  href={booking.conference_room}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-color-1 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  <VideoCameraIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Join Meeting</span>
                </a>
              )}
            </div>

            {booking.user_additional_information && (
              <div className="mt-4 pt-4 border-t border-n-12">
                <div className="flex items-start gap-2 text-sm text-n-3">
                  <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <p className="break-words">{booking.user_additional_information}</p>
                </div>
              </div>
            )}

            <button
              onClick={e => handleDelete(booking.booking_id, e)}
              className="absolute top-4 right-4 sm:top-auto sm:bottom-5 sm:right-5 text-n-1 hover:text-n-2 transition-colors bg-color-1 rounded-full p-1"
            >
              <div className="flex items-center gap-1 px-2">
                <TrashIcon className="w-5 h-5" />
                <p className="text-xs">Delete</p>
              </div>
            </button>
          </div>
        ))
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-n-7 p-6 rounded-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-n-1 mb-2">
              Delete Booking
            </h3>
            <p className="text-n-3 mb-6">
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-n-1 bg-n-6 rounded-lg hover:bg-n-5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-color-2 rounded-lg hover:bg-color-2/80 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpcomingBookings
