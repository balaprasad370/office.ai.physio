"use client"

import React, { useState, useRef, useEffect } from "react"
import { formatDate } from "@fullcalendar/core"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import apiClient from "@/lib/axios/apiClient"
import moment from "moment"
import { Loader2, X, User, Mail, Phone, Clock, Calendar, Info, Video, Globe, Building, Calendar as CalendarIcon, Copy, ExternalLink } from "lucide-react"

export default function CalendarView() {
  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [currentEvents, setCurrentEvents] = useState([])
  const [currentView, setCurrentView] = useState("dayGridMonth")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const calendarRef = useRef(null)
  const [currentDateEvents, setCurrentDateEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const getEvents = async (abortController) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await apiClient.get("/v1/calendar/events", {
        params: {
          date: moment(currentDate).format("YYYY-MM-DD"),
        },
        signal: abortController.signal
      })

      console.log("events", result.data)

      if (result.data.status && result.data.data) {
        const formattedEvents = result.data.data.map(booking => ({
          id: booking.booking_id.toString(),
          title: `${booking.user_full_name} - ${booking.user_email}`,
          start: booking.start_time,
          end: booking.end_time,
          allDay: false,
          backgroundColor: "#AC6AFF",
          borderColor: "#252134",
          textColor: "#FFFFFF",
          editable: false,
          extendedProps: {
            conferenceRoom: booking.conference_room,
            domain: booking.domain,
            additionalInfo: booking.user_additional_information,
            duration: booking.slot_duration,
            userFullName: booking.user_full_name,
            userEmail: booking.user_email,
            userMobile: booking.user_mobile,
            bookingCreatedDate: booking.booking_created_date,
            timezone: booking.timezone
          },
          url: `${booking.conference_room}`,
        }))
        setCurrentEvents(formattedEvents)
      }
    } catch (error) {
      if (!error.name === 'AbortError') {
        setError("Failed to fetch events. Please try again later.")
        console.error(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    getEvents(abortController)
    
    return () => {
      abortController.abort()
    }
  }, [currentDate])

  function handleDateSelect(selectInfo) {
    let title = prompt("Please enter a new title for your event")
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect()

    if (title) {
      calendarApi.addEvent({
        id: Date.now().toString(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      })
    }
  }

  function handleEvents(events) {
    setCurrentDateEvents(events)
  }

  function handleDatesSet(arg) {
    setCurrentDate(arg.start)
    setCurrentView(arg.view.type)
  }

  function handleEventClick(clickInfo) {
    clickInfo.jsEvent.preventDefault()
    setSelectedEvent(clickInfo.event)
    setShowModal(true)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (error) {
    return (
      <div className="w-full p-5 bg-n-8 rounded-lg">
        <div className="text-color-3 text-center p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full p-5 bg-n-8 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-n-7 rounded-lg p-4 shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 bg-n-8/50 z-50 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-n-1" /> 
              <p className="text-n-1">Fetching events...</p>
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            timeZone="local"
            initialView="timeGridDay"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={weekendsVisible}
            events={currentEvents}
            select={handleDateSelect}
            eventsSet={handleEvents}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            className="fc-theme-standard"
          />
        </div>
      </div>

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-n-8/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-n-7 rounded-xl p-8 max-w-5xl w-full mx-4 text-n-1 shadow-2xl border border-n-5">
            <div className="flex justify-between items-center mb-6 border-b border-n-6 pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-color-1" />
                Event Details
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-n-6 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-n-8 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-color-1 mb-4">Meeting Link</h3>
                  <div className="bg-n-6 p-4 rounded-lg flex items-center justify-between">
                    <a 
                      href={selectedEvent.extendedProps.conferenceRoom} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-color-1 hover:underline truncate flex-1"
                    >
                      {selectedEvent.extendedProps.conferenceRoom}
                    </a>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(selectedEvent.extendedProps.conferenceRoom)}
                        className="p-2 hover:bg-n-5 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-5 h-5 text-color-1" />
                      </button>
                      <a 
                        href={selectedEvent.extendedProps.conferenceRoom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-n-5 rounded-lg transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-5 h-5 text-color-1" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-color-1">Time Details</h3>
                    <div className="bg-n-6 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-color-1" />
                        <p><span className="font-medium">Start:</span> {moment(selectedEvent.start).format('MMMM D, YYYY h:mm A')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-color-1" />
                        <p><span className="font-medium">End:</span> {moment(selectedEvent.end).format('MMMM D, YYYY h:mm A')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-color-1" />
                        <p><span className="font-medium">Timezone:</span> {selectedEvent.extendedProps.timezone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-color-1">Contact Information</h3>
                    <div className="bg-n-6 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-color-1" />
                        <p className="font-medium">{selectedEvent.extendedProps.userFullName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-color-1" />
                        <a href={`mailto:${selectedEvent.extendedProps.userEmail}`} className="text-color-1 hover:underline">{selectedEvent.extendedProps.userEmail}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-color-1" />
                        <p>{selectedEvent.extendedProps.userMobile || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-n-8 rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-color-1 mb-3">Additional Details</h3>
                  <div className="bg-n-6 p-4 rounded-lg">
                    <p className="text-sm">{selectedEvent.extendedProps.additionalInfo || 'No additional information provided'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-color-1 mb-3">Domain</h3>
                  <div className="bg-n-6 p-4 rounded-lg">
                    <p>{selectedEvent.extendedProps.domain}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-color-1 mb-3">Booking Created</h3>
                  <div className="bg-n-6 p-4 rounded-lg">
                    <p>{moment(selectedEvent.extendedProps.bookingCreatedDate).format('MMMM D, YYYY h:mm A')}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(selectedEvent.extendedProps.conferenceRoom, '_blank')}
                    className="flex-1 px-4 py-2 bg-color-1 hover:bg-color-1/90 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-5 h-5" />
                    Join Meeting
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-n-6 hover:bg-n-5 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
