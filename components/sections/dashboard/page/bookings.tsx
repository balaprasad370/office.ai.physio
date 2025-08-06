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
  ArrowRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

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

const Bookings = () => {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    handleGetBookings("upcoming")
    handleGetEvents()
  }, [])

  const handleGetEvents = async () => {
    try {
      const response = await apiClient.get("/profile/events")
      if (response.data.status) {
        setEvents(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  const handleGetBookings = async (tab: string) => {
    setLoading(true)
    setBookings([]);
    try {
      const response = await apiClient.get(`/v1/schedule/getBookings/${tab}`)
      if (response.data.status) {
        setBookings(response.data.data.slice(0, 3)) // Only take first 3 bookings
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
        const response = await apiClient.delete(`/v1/schedule/${deletingId}`)
        if (response.data.status) {
          setBookings(prev =>
            prev.filter((b: any) => b.booking_id !== deletingId),
          )
          setShowConfirmDelete(false)
          setDeletingId(null)
        }
      } catch (error) {
        console.error("Error deleting booking:", error)
        toast.error(response?.data?.message || "Failed to delete booking")
      } finally {
        setShowConfirmDelete(false)
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-n-12 rounded-lg p-4  h-full">
      <div className="flex justify-between items-center ">
        <div>
          <h1 className="text-lg font-bold text-n-1">Upcoming Bookings</h1>
          <p className="text-n-3 text-[10px] mt-0.5">
            Manage your scheduled appointments
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleGetBookings("upcoming")}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-n-1 border border-n-2 hover:bg-color-1 rounded hover:bg-opacity-70 transition-all shadow-sm shadow-color-1/20 focus:outline-none focus:ring-2 focus:ring-color-1/40"
            aria-label="Refresh"
            type="button"
          >
            <ArrowPathIcon className="w-4 h-4 text-n-1" />
          </button>

          <button
            onClick={() => router.push("/dashboard/bookings")}
            className="px-1.5 py-0.5 text-[10px] font-medium text-n-1 bg-color-1 rounded hover:bg-opacity-50 transition-all shadow-sm shadow-color-1/20"
          >
            View All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-color-1"></div>
        </div>
      ) : bookings.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-3 bg-n-7 rounded-lg border border-n-12 h-full">
          <div className="w-16 h-16 rounded-full bg-color-1/10 flex items-center justify-center mb-4">
            <CalendarDaysIcon className="w-10 h-10 text-color-1" />
          </div>
          <h3 className="text-n-1 text-lg font-semibold text-center mb-2">
            No Upcoming Bookings
          </h3>
          {!events.length ? (
            <>
              <p className="text-n-3 text-sm text-center max-w-sm mb-8">
                You haven't set up your availability yet. Set your available
                hours to start accepting bookings.
              </p>
              <button
                onClick={() => router.push("/dashboard/availability")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-color-1 text-n-1 rounded-xl hover:bg-color-1/90 transition-all shadow-lg shadow-color-1/20 font-medium max-w-[200px]"
              >
                Set Availability
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <p className="text-n-3 text-sm text-center max-w-sm mb-8">
                Your availability is set up! Share your booking link with
                clients to start receiving appointments.
              </p>
              <button
                onClick={() => {
                  console.log(events[0].domain)
                  router.push("https://"+events[0].domain)
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-color-1 text-n-1 rounded-xl hover:bg-color-1/90 transition-all shadow-lg shadow-color-1/20 font-medium max-w-[200px]"
              >
                Share Profile
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="mt-8 px-4 py-3 bg-n-6 rounded-lg border border-n-12 max-w-md mx-4">
            <p className="text-n-2 text-sm text-center">
              Need help getting started? Check out our{" "}
              <a href="/help" className="text-color-1 hover:underline">
                quick setup guide
              </a>
            </p>
          </div>
        </div>
      ) : (
        <>
          {bookings.map(booking => (
            <div
              key={booking.booking_id}
              className="p-3 rounded-lg border border-n-12 bg-n-7 relative hover:border-color-1 transition-all cursor-pointer"
              onClick={() =>
                router.push(`/dashboard/bookings/${booking.booking_id}`)
              }
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-color-1/10 flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-color-1" />
                </div>

                <div className="flex-1">
                  <h4 className="font-medium text-sm text-n-1 mb-0.5">
                    {booking.user_full_name}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs text-n-3">
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" />
                      {booking.user_mobile}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{booking.user_email}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto mt-1.5 sm:mt-0">
                  <span
                    className={`w-full sm:w-auto px-2 py-1 text-[10px] font-medium rounded-full inline-block text-center ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-n-2">
                  <ClockIcon className="w-3 h-3 text-n-3 flex-shrink-0" />
                  <span>
                    {moment(booking.start_time).format("hh:mm A")} -{" "}
                    {moment(booking.end_time).format("hh:mm A")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-n-2">
                  <CalendarDaysIcon className="w-3 h-3 text-n-3 flex-shrink-0" />
                  <span>
                    {moment(booking.start_time).format("MMM D, YYYY")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-n-2">
                  <GlobeAltIcon className="w-3 h-3 text-n-3 flex-shrink-0" />
                  <span>{booking.timezone}</span>
                </div>

                {booking.conference_room && (
                  <a
                    href={booking.conference_room}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-color-1 hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    <VideoCameraIcon className="w-3 h-3 flex-shrink-0" />
                    <span>Join Meeting</span>
                  </a>
                )}
              </div>

              {booking.user_additional_information && (
                <div className="mt-3 pt-3 border-t border-n-12">
                  <div className="flex items-start gap-1.5 text-xs text-n-3">
                    <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
                    <p className="break-words">
                      {booking.user_additional_information}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={e => handleDelete(booking.booking_id, e)}
                className="absolute top-3 right-3 sm:top-auto sm:bottom-3 sm:right-3 text-n-1 hover:text-n-2 transition-colors bg-color-1 rounded-full p-0.5"
              >
                <div className="flex items-center gap-0.5 px-1.5">
                  <TrashIcon className="w-4 h-4" />
                  <p className="text-[10px]">Delete</p>
                </div>
              </button>
            </div>
          ))}
        </>
      )}

      {bookings.length === 1 && (
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-n-7 rounded-lg border border-n-12 border-dashed">
          <div className="w-12 h-12 rounded-full bg-color-1/10 flex items-center justify-center mb-3">
            <CalendarDaysIcon className="w-7 h-7 text-color-1" />
          </div>
          <h3 className="text-n-1 font-semibold text-center mb-1">
            Just one upcoming session — let's bring in more!
          </h3>
          <p className="text-n-3 text-sm text-center mb-4">
            Keep your calendar full by sharing your booking link with clients. The easier it is to book you, the more they will!
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-color-1 text-n-1 rounded-lg hover:bg-color-1/90 transition-colors text-sm font-medium">
            Share Booking Link
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3">
          <div className="bg-n-7 p-4 rounded-lg max-w-md lg:max-w-xl w-full border-2 border-n-12">
            <h3 className="text-lg font-semibold text-n-1 mb-1.5">
              Delete Booking
            </h3>
            <p className="text-n-3 text-md mb-4">
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="w-full sm:w-auto px-3 py-1.5 text-md font-medium text-n-1 bg-n-6 rounded hover:bg-n-5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-3 py-1.5 text-md font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
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

export default Bookings
