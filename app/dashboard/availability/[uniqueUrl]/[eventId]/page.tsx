"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {apiClient} from "@/lib/axios";
import  Button  from "@/components/atoms/button";
import {
  IconPlus,
  IconChevronDown,
  IconCheck,
  IconMinus,
  IconArrowLeft,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import moment from "moment";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/atoms/command";
import EditAvailabilitySwitch from "@/components/sections/availability/components/EditAvailabilitySwitch";
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/atoms/select";
import momentTz from "moment-timezone";
import { Calendar } from "@/components/atoms/calendar";
import { Checkbox } from "@/components/atoms/checkbox";
import { toast } from "sonner";

const Index = () => {
  const { uniqueUrl, eventId } = useParams();
  const  apiEndPoint  = "https://schedule.ai.physio/";

  const [timezone, setTimezone] = useState(
    momentTz.tz.guess() == "Asia/Calcutta" ? "Asia/Kolkata" : momentTz.tz.guess()
  );
  const [open, setOpen] = useState(false);
  const [dayStates, setDayStates] = useState({});
  const timeZones = momentTz.tz.names();

  const [slotDuration, setSlotDuration] = useState(15);
  const [slotDurationLoading, setSlotDurationLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState({});
  const [dayTimeRanges, setDayTimeRanges] = useState({});
  const [daySlotCount, setDaySlotCount] = useState({});
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });
  const [limitToDateRange, setLimitToDateRange] = useState(false);

  const [getAvailabilityLoading, setGetAvailabilityLoading] = useState(true);
  const [availability, setAvailability] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);


  const [weekDays, setWeekDays] = useState([
    "Sunday",
    "Monday", 
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);

  const getAvailability = async () => {
    try {
      const response = await apiClient.get(`/v1/events/availability/${uniqueUrl}`);

      if (response.data.status) {
        const availabilityData = response.data.data.availability_days;
        setAvailability(availabilityData);
        setSlotDuration(response.data.data.slot_duration);
        setSlotDurationLoading(false);
        setTimezone(response.data.data.timezone);

        if (
          response.data.data.date_range.from_date &&
          response.data.data.date_range.end_date
        ) {
          setLimitToDateRange(true);
          setDateRange({
            from: moment(response.data.data.date_range.from_date),
            to: moment(response.data.data.date_range.end_date),
          });
        }

        const newDayStates = {};
        const newDayTimeRanges = {};

        availabilityData.forEach((day) => {
          newDayStates[day.day_name] = day.is_available;
          if (day.time_slots.length > 0) {
            newDayTimeRanges[day.day_name] = day.time_slots.map((slot) => ({
              start: slot.start_time ? slot.start_time : "09:00",
              end: slot.end_time ? slot.end_time : "17:00",
            }));
          }
        });

        setDayStates(newDayStates);
        setDayTimeRanges(newDayTimeRanges);
        setGetAvailabilityLoading(false);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  useEffect(() => {
    getAvailability();
  }, []);

  useEffect(() => {
    if (!slotDurationLoading) {
      weekDays.forEach((day) => {
        if (dayStates[day] && !dayTimeRanges[day]?.length) {
          handleAddTimeSlot(day);
        }
      });
    }
  }, [dayStates, slotDurationLoading]);

  const generateTimeSlots = (duration) => {
    const slots = [];
    const start = moment("00:00", "HH:mm");
    const end = moment("23:59", "HH:mm");

    while (start.isSameOrBefore(end)) {
      slots.push(start.format("HH:mm"));
      start.add(duration, "minutes");
    }
    return slots;
  };

  const getAvailableTimeSlots = (day, slotIndex, type) => {
    const slots = generateTimeSlots(slotDuration);
    const ranges = dayTimeRanges[day] || [];

    return slots.filter((time) => {
      const timeValue = moment(time, "HH:mm");

      if (type === "end" && ranges[slotIndex]?.start) {
        const slotStart = moment(ranges[slotIndex].start, "HH:mm");
        return timeValue.isAfter(slotStart);
      }

      if (type === "start" && ranges[slotIndex]?.end) {
        const slotEnd = moment(ranges[slotIndex].end, "HH:mm");
        return timeValue.isBefore(slotEnd);
      }

      return true;
    });
  };

  const handleTimeChange = (day, type, value, slotIndex = 0) => {
    setDayTimeRanges((prev) => {
      const dayRanges = [...(prev[day] || [])];

      if (!dayRanges[slotIndex]) {
        dayRanges[slotIndex] = {};
      }

      dayRanges[slotIndex] = {
        ...dayRanges[slotIndex],
        [type]: value,
      };

      return {
        ...prev,
        [day]: dayRanges,
      };
    });
  };

  const handleAddTimeSlot = (day) => {
    setDaySlotCount((prev) => ({
      ...prev,
      [day]: (prev[day] || 0) + 1,
    }));

    const prevSlots = dayTimeRanges[day] || [];
    const lastSlot = prevSlots[prevSlots.length - 1];

    let defaultStart, defaultEnd;
    if (lastSlot) {
      defaultStart = moment(lastSlot.end, "HH:mm").format("HH:mm");
      defaultEnd = moment(defaultStart, "HH:mm")
        .add(60, "minutes")
        .format("HH:mm");
    } else {
      defaultStart = "09:00";
      defaultEnd = "17:00";
    }

    setDayTimeRanges((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: defaultStart, end: defaultEnd }],
    }));
  };

  const handleDeleteTimeSlot = (day, index) => {
    setDayTimeRanges((prev) => {
      const dayRanges = [...(prev[day] || [])];
      dayRanges.splice(index, 1);
      return {
        ...prev,
        [day]: dayRanges,
      };
    });

    setDaySlotCount((prev) => ({
      ...prev,
      [day]: Math.max(0, (prev[day] || 0) - 1),
    }));
  };

  const handleToggleDay = (day, enabled) => {
    setDayStates((prev) => ({
      ...prev,
      [day]: enabled,
    }));
    if (!enabled) {
      setTimeSlots((prev) => {
        const newSlots = { ...prev };
        delete newSlots[day];
        return newSlots;
      });
      setDayTimeRanges((prev) => {
        const newRanges = { ...prev };
        delete newRanges[day];
        return newRanges;
      });
      setDaySlotCount((prev) => {
        const newCount = { ...prev };
        delete newCount[day];
        return newCount;
      });
    }
  };

  const handleSave = async () => {
    setSaveClicked(true);
    setSaveLoading(true);

    const availabilityDays = weekDays.map((day) => ({
      day_name: day,
      is_available: dayStates[day] && dayTimeRanges[day]?.length > 0 ? 1 : 0,
      time_slots:
        dayTimeRanges[day]?.map((slot) => ({
          start_time: slot.start,
          end_time: slot.end,
        })) || [],
    }));

    const data = {
      timezone,
      slot_duration: slotDuration,
      unique_url: uniqueUrl,
      schedule_event_id: eventId,
      date_range: limitToDateRange
        ? {
            from_date: moment(dateRange.from).format("YYYY-MM-DD"),
            end_date: moment(dateRange.to).format("YYYY-MM-DD"),
          }
        : null,
      has_date_range: limitToDateRange,
      availability_days: availabilityDays,
    };

    try {
      const response = await apiClient.post(`/v1/events/availability/update`,
        data);

      if (response.data.status) {
        toast.success("Availability updated successfully");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (getAvailabilityLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen px-4 py-8 lg:overflow-y-scroll">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold md:text-2xl">Edit Availability</h1>
          </div>

          <div className="block lg:hidden">
            <Button
              className="w-full disabled:opacity-50 md:w-auto"
              onClick={handleSave}
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4 shadow-sm md:p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
            <div className="flex w-full flex-col gap-4 md:w-1/2 md:flex-row">
              <div className="mb-4 flex flex-col gap-2 md:mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Duration
                </label>
                <div>
                  {slotDurationLoading
                    ? "loading..."
                    : `${slotDuration} minutes`}
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-2 md:mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Time Zone
                </label>
                <Popover className="relative">
                  <PopoverButton >
                    <div
                      className="w-full flex justify-between border border-n-2 rounded-lg p-2 "
                    >
                      {timezone || "Select timezone..."}
                      <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </PopoverButton>
                  <PopoverPanel anchor="bottom" className="flex flex-col bg-n-7 border-n-5 border rounded-lg">
                    <Command>
                      <CommandInput placeholder="Search timezone..." />
                      <CommandEmpty>No timezone found.</CommandEmpty>
                      <CommandGroup className="max-h-[400px] overflow-y-auto">
                        {timeZones.map((tz) => (
                          <CommandItem
                            key={tz}
                            value={tz}
                            onSelect={() => {
                              setTimezone(tz);
                              setOpen(false);
                            }}
                          >
                            <IconCheck
                              className={cn(
                                "mr-2 h-4 w-4",
                                timezone === tz ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {tz}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverPanel>
                </Popover>
              </div>
            </div>

            <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
              <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto lg:flex-nowrap">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={limitToDateRange}
                      onCheckedChange={setLimitToDateRange}
                    />
                    <p>Set Limit </p>
                  </div>

                  {limitToDateRange && (
                    <Popover className="relative">
                      <PopoverButton className="border border-n-2 p-2 rounded-lg">
                        <div className="w-full">
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {moment(dateRange.from).format("MMM DD, YYYY")}{" "}
                                - {moment(dateRange.to).format("MMM DD, YYYY")}
                              </>
                            ) : (
                              moment(dateRange.from).format("MMM DD, YYYY")
                            )
                          ) : (
                            "Select date range..."
                          )}
                        </div>
                      </PopoverButton>
                      <PopoverPanel anchor="bottom" className="flex flex-col bg-n-7 border-n-5 border rounded-lg">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                          className="w-full"
                          showOutsideDays={false}
                          fixedWeeks
                          fromDate={new Date()}
                          toDate={
                            new Date(
                              new Date().setMonth(new Date().getMonth() + 6)
                            )
                          }
                          modifiers={{ today: null }}
                        />
                      </PopoverPanel>
                    </Popover>
                  )}
                </div>

                <div className="hidden lg:block">
                  <Button
                    className="w-full disabled:opacity-50 md:block md:w-auto"
                    onClick={handleSave}
                    disabled={saveLoading}
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {weekDays.map((day) => (
            <div
              key={day}
              className="w-full border-b py-4 last:border-b-0 md:w-10/12"
            >
              <div className="mb-4 flex w-full flex-col items-start justify-between gap-4 px-2 md:flex-row md:items-center md:px-4 xl:w-3/4">
                <div className="flex items-center gap-4">
                  <EditAvailabilitySwitch
                    dayStatus={dayStates[day]}
                    day={day}
                    handleToggleDay={handleToggleDay}
                  />
                  <h3 className="font-medium">{day}</h3>
                </div>
                <div className="flex w-full flex-col items-start gap-4 md:w-auto md:items-center">
                  {dayStates[day] &&
                    (dayTimeRanges[day] || []).map((slot, index) => (
                      <div key={index} className="w-full space-y-3 md:w-auto">
                        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                          <Select
                            value={slot.start}
                            onValueChange={(value) =>
                              handleTimeChange(day, "start", value, index)
                            }
                          >
                            <SelectTrigger className="w-[80px] md:w-[100px]">
                              <SelectValue placeholder="Start time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {getAvailableTimeSlots(day, index, "start").map(
                                  (time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <span> - </span>
                          <Select
                            value={slot.end}
                            onValueChange={(value) =>
                              handleTimeChange(day, "end", value, index)
                            }
                          >
                            <SelectTrigger className="w-[80px] md:w-[100px]">
                              <SelectValue placeholder="End time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {getAvailableTimeSlots(day, index, "end").map(
                                  (time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>

                          {dayStates[day] && index === 0 && (
                            <div
                              className="cursor-pointer p-2 text-green-500 hover:rounded-md hover:bg-green-200 hover:text-green-500"
                              onClick={() => handleAddTimeSlot(day)}
                            >
                              <IconPlus className="font-bold" size={16} />
                            </div>
                          )}

                          {dayStates[day] && index !== 0 && (
                            <div
                              className="cursor-pointer p-2 text-red-500 hover:rounded-md hover:bg-red-200 hover:text-red-500"
                              onClick={() => handleDeleteTimeSlot(day, index)}
                            >
                              <IconMinus className="font-bold" size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;