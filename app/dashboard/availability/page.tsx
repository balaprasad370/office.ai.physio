"use client"

import React, { useEffect, useState } from "react"
import { apiClient } from "@/lib/axios"
import { toast } from "sonner"
import Button from "@/components/atoms/button"
import {
  Plus,
  Clock,
  Trash,
  Edit,
  ExternalLink,
  Link as LinkIcon,
  DollarSign,
  Calendar,
} from "lucide-react"
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/atoms/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/atoms/alert-dialog"
import { Badge } from "@/components/atoms/badge"
import { useRouter } from "next/navigation"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select"
import { Checkbox } from "@/components/atoms/checkbox"
import EventStatus from "@/components/sections/availability/components/EventStatus"
import momentTz from "moment-timezone"


export default function AvailabilityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [initialRender, setinitialRender] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDomainBoughtLoading, setIsDomainBoughtLoading] = useState(true)
  const [domains, setDomains] = useState([])

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    domain: '',
    unique_url: '',
    ispayment_gateway: false,
    payment_amount: 0,
    duration: '15'
  })

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    unique_url: '',
    duration: '',
    payment_amount: ''
  })

  const [timezone, setTimezone] = useState(
    momentTz.tz.guess() === 'Asia/Calcutta' 
      ? 'Asia/Kolkata'
      : momentTz.tz.guess()
  )

  useEffect(() => {
    fetchEvents()
    fetchDomains()
  }, [])

  const fetchEvents = async () => {
    if (!initialRender) {
      setEventsLoading(true)
    }
    try {
      const response = await apiClient.get("/v1/events")
      if (response.data.status) {
        setEvents(response.data.data)
        setinitialRender(true)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("Failed to fetch events")
    } finally {
      setEventsLoading(false)
    }
  }

  const fetchDomains = async () => {
    setIsDomainBoughtLoading(true)
    try {
      const response = await apiClient.get("/v1/domain")
      const result = response.data.data

      if (result.length) {
        const domains = []
        for (const domain of result) {
          domains.push(domain.subdomain)
        }
        setDomains(domains)
        setEventData({ ...eventData, domain: domains[0] })
      }
    } catch (error) {
      console.error('Error fetching domains:', error)
    } finally {
      setIsDomainBoughtLoading(false)
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      title: '',
      description: '',
      unique_url: '',
      duration: '',
      payment_amount: ''
    }

    if (!eventData.title) {
      newErrors.title = 'Title is required'
      isValid = false
    }

    if (!eventData.description) {
      newErrors.description = 'Description is required'
      isValid = false
    }

    if (!eventData.unique_url) {
      newErrors.unique_url = 'URL is required'
      isValid = false
    }

    if (!eventData.duration) {
      newErrors.duration = 'Duration is required'
      isValid = false
    }

    if (eventData.ispayment_gateway && eventData.payment_amount < 1) {
      newErrors.payment_amount = 'Payment amount must be greater than 0'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }
    setIsSubmitting(true)
    try {
      const url = editingEvent 
        ? `/v1/events/${editingEvent.schedule_event_id}`
        : "/v1/events"

      const method = editingEvent ? 'put' : 'post'

      const formData = {
        ...eventData,
        payment_amount: eventData.ispayment_gateway ? Number(eventData.payment_amount) : 0,
        duration: Number(eventData.duration),
        timezone: timezone
      }

      const response = await apiClient[method](url, formData)

      if (response.data.status) {
        setIsOpen(false)
        setEventData({
          title: '',
          description: '',
          domain: domains[0] || '',
          unique_url: '',
          ispayment_gateway: false,
          payment_amount: 0,
          duration: '15'
        })
        setEditingEvent(null)
        setErrors({
          title: '',
          description: '',
          unique_url: '',
          duration: '',
          payment_amount: ''
        })
        if (!editingEvent) {
          router.push(`/dashboard/availability/${eventData.unique_url}/${response.data.data.id}`)
        }
        fetchEvents()
        toast.success(editingEvent ? "Event updated successfully" : "Event created successfully")
      }
    } catch (error) {
      console.error("Error saving event:", error)
      toast.error("Failed to save event")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (eventId) => {
    try {
      const response = await apiClient.delete(`/v1/events/${eventId}`)
      if (response.data.status) {
        toast.success("Event deleted successfully")
        fetchEvents()
      }
    } catch (error) {
      toast.error("Failed to delete event")
    }
  }

  const handleCopyLink = (event) => {
    navigator.clipboard.writeText(
      `https://${event.domain}/${event.unique_url}`
    )
    toast.success("Link copied to clipboard")
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setEventData({
      title: event.title,
      description: event.description,
      duration: String(event.slot_duration),
      domain: event.domain || domains[0],
      unique_url: event.unique_url || '',
      ispayment_gateway: Boolean(event.is_payment_gateway),
      payment_amount: event.amount || 0
    })
    setErrors({
      title: '',
      description: '',
      unique_url: '',
      duration: '',
      payment_amount: ''
    })
    setIsOpen(true)
  }

  const handleEventStatus = async (eventId, status) => {
    try {
      const response = await apiClient.put("/v1/events/", {
        event_status: status,
        event_id: eventId
      })

      if(response.data.status){
        toast.success(response.data?.message || "Changes applied successfully");
      }

    } catch (error) {
      toast.error("Changes not applied");
      console.error('Error updating event status:', error)
    }
  }

  if (isDomainBoughtLoading){
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color-1"></div>
      </div>
    )
  }

  return (
        <div className="flex flex-col border border-n-12 rounded-lg p-7 h-full m-2 gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-lg font-bold text-n-1">Event Management</h1>
              <p className="text-n-3 text-[10px] mt-0.5">
                Configure and manage your scheduling availability
              </p>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-1 px-2 py-1 font-medium text-n-1 bg-color-1 rounded-xl hover:bg-opacity-50 transition-all">
                  <div className="flex gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Event
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xl border-l border-n-1/20">
                <SheetHeader>
                  <SheetTitle className="text-lg font-bold text-n-1">
                    {editingEvent ? 'Edit Event Type' : 'Create New Event Type'}
                  </SheetTitle>
                  <SheetDescription className="text-n-3 text-[10px]">
                    Fill in the details for your event type
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-8 px-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1">Title *</Label>
                      <Input
                        type="text"
                        value={eventData.title}
                        onChange={(e) => {
                          const title = e.target.value
                          const url = title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '')
                          setEventData({
                            ...eventData,
                            title,
                            unique_url: url
                          })
                          if (errors.title) {
                            setErrors({...errors, title: ''})
                          }
                        }}
                        className={errors.title ? 'border-red-500' : ''}
                        placeholder="Quick Meeting"
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Description *</Label>
                      <Input
                        as="textarea"
                        value={eventData.description}
                        onChange={(e) => {
                          setEventData({...eventData, description: e.target.value})
                          if (errors.description) {
                            setErrors({...errors, description: ''})
                          }
                        }}
                        className={errors.description ? 'border-red-500' : ''}
                        placeholder="A brief catch-up"
                        rows={3}
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className='w-full space-y-2'>
                      <Label htmlFor='domain'>URL *</Label>
                      <div className='flex flex-col gap-2 sm:flex-row'>
                        <Select
                          value={eventData.domain || domains[0]}
                          onValueChange={(value) =>
                            setEventData({ ...eventData, domain: value })
                          }
                        >
                          <SelectTrigger className='w-full sm:w-[200px]'>
                            <SelectValue placeholder='Select domain' />
                          </SelectTrigger>
                          <SelectContent>
                            {domains.map((domain) => (
                              <SelectItem key={domain} value={domain}>
                                {domain}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className='relative flex-1'>
                          <span className='absolute inset-y-0 left-3 flex items-center text-gray-500'>
                            /
                          </span>
                          <Input
                            type='text'
                            value={eventData.unique_url}
                            onChange={(e) => {
                              const value = e.target.value
                              const validatedValue = value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, '')
                                .replace(/^-+|-+$/g, '')
                              setEventData({
                                ...eventData,
                                unique_url: validatedValue,
                              })
                              if (errors.unique_url)
                                setErrors({ ...errors, unique_url: '' })
                            }}
                            className={`w-full rounded-md border px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                              errors.unique_url
                                ? 'border-red-500'
                                : 'border-input'
                            }`}
                            placeholder='quick-meeting'
                          />
                        </div>
                      </div>
                      {errors.unique_url && (
                        <p className='text-sm text-red-500'>
                          {errors.unique_url}
                        </p>
                      )}
                      <p className='text-xs text-gray-500'>
                        Your booking link: {eventData.domain || domains[0]}/
                        {eventData.unique_url || 'event-link'}
                      </p>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Duration (minutes) *</Label>
                      <Select
                        value={eventData.duration}
                        onValueChange={(value) => {
                          setEventData({...eventData, duration: value})
                          if (errors.duration) {
                            setErrors({...errors, duration: ''})
                          }
                        }}
                      >
                        <SelectTrigger className={errors.duration ? 'border-red-500 w-full' : 'w-full'}>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={eventData.ispayment_gateway}
                        onCheckedChange={(checked) => setEventData({...eventData, ispayment_gateway: checked})}
                        className="rounded border-gray-300"
                      />
                      <Label>Enable Payment</Label>
                    </div>

                    {eventData.ispayment_gateway && (
                      <div>
                        <Label className="block text-sm font-medium mb-1">Amount *</Label>
                        <Input
                          type="number"
                          value={eventData.payment_amount}
                          onChange={(e) => {
                            setEventData({...eventData, payment_amount: Number(e.target.value)})
                            if (errors.payment_amount) {
                              setErrors({...errors, payment_amount: ''})
                            }
                          }}
                          className={errors.payment_amount ? 'border-red-500' : ''}
                          min="0"
                        />
                        {errors.payment_amount && <p className="text-red-500 text-sm mt-1">{errors.payment_amount}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <SheetFooter>
                  <Button
                    onClick={handleSubmit}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-n-1 bg-color-1 rounded hover:bg-opacity-50 transition-all shadow-sm shadow-color-1/20"
                  >
                    {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-full bg-color-1/10 flex items-center justify-center mb-3">
                <Calendar className="w-7 h-7 text-color-1" />
              </div>
              <h3 className="text-n-1 font-semibold text-center mb-1">
                No Events Created
              </h3>
              <p className="text-n-3 text-sm text-center">
                Get started by creating your first event type to share with others.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[20rem]">
              {events.map((event,index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-n-12 bg-n-7 flex flex-col  justify-between relative hover:border-color-1 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-between sm:flex-row justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-color-1/10 flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-color-1" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-n-1 mb-1">{event.title}</h4>
                      <p className="line-clamp-2 text-xs text-n-3">{event.description}</p>
                    </div>

                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                      {event.is_payment_gateway === 1 && (
                        <span className="w-full sm:w-auto px-3 py-1.5 text-[10px] font-medium rounded-xl inline-block text-center bg-color-4/10 text-color-4 border border-color-4/20">
                          ${event.amount} - Paid Event
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs mb-4">
                    <div className="flex items-center gap-2 text-n-2">
                      <Clock className="w-4 h-4 text-n-3 flex-shrink-0" />
                      <span>{event.slot_duration} minutes</span>
                    </div>

                    <div className="flex items-center gap-2 text-n-2">
                      <LinkIcon className="w-4 h-4 text-n-3 flex-shrink-0" />
                      <span>{event.domain}/{event.unique_url}</span>
                    </div>
                  </div>

                    <EventStatus
                    eventId={event.schedule_event_id}
                    eventStatus={event.event_status}
                    handleEventStatus={handleEventStatus}
                  />


                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 pt-3 border-t border-n-12">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://${event.domain}/${event.unique_url}`)
                      }}
                      className="flex flex-row items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-n-1 bg-n-6 rounded-xl hover:bg-n-5 transition-colors border border-n-4/50"
                    >
                      <div className="flex gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Preview
                      </div>
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyLink(event)
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-n-1 bg-n-6 rounded-xl hover:bg-n-5 transition-colors border border-n-4/50"
                    >
                      <div className="flex gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                      </div>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button  className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors border border-n-4/50">
                         
                        <div className="flex gap-2"> <Trash className="w-4 h-4" />
                          Delete
                          </div>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-n-7 border border-n-12 p-4 rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-n-1 text-lg font-semibold">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-n-3 text-sm">
                            This action cannot be undone. This will permanently delete your event.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="px-4 py-2 text-[10px] font-medium text-n-1 bg-n-6 rounded-xl hover:bg-n-5 transition-colors">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(event.schedule_event_id)}
                            className="px-4 py-2 text-[10px] font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-n-1 bg-n-6 rounded-xl hover:bg-n-5 transition-colors border border-n-4/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(event)
                      }}
                    >
                      <div className="flex gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                      </div>
                    </Button>

                    <Button
                      className="flex col-span-2 items-center gap-2  py-1.5 text-[10px] font-medium text-n-1 bg-n-6 rounded-xl hover:bg-n-5 transition-colors px-2 border border-n-4/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/availability/${event.unique_url}/${event.schedule_event_id}`)
                      }}
                    >
                      <div className="flex gap-2 px-4">
                      <Clock className="w-4 h-4" />
                      Availability
                      </div>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
 
  )
}
