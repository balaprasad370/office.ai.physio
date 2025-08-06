import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-n-8/95 rounded-2xl border border-n-6", className)}
      classNames={{
        months: "flex flex-col space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-n-1 text-sm font-medium",
        nav: "space-x-1 flex items-center justify-between",
        nav_button: cn(
          "h-7 w-7 bg-n-6 rounded-lg p-0 hover:bg-n-5 transition-colors"
        ),
        nav_button_previous: "absolute left-1 text-n-1",
        nav_button_next: "absolute right-1 text-n-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-n-3 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-n-6 [&:has([aria-selected].day-outside)]:bg-n-6/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "h-8 w-8 p-2 font-normal text-n-1 rounded-lg hover:bg-color-1 cursor-pointer transition-colors aria-selected:opacity-100 text-center"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-color-1 text-n-1 hover:bg-color-1/90 focus:bg-color-1 focus:text-n-1",
        day_today: "bg-n-6 text-n-1 font-semibold",
        day_outside:
          "day-outside text-n-4 opacity-50 aria-selected:bg-n-6/50 aria-selected:text-n-4 aria-selected:opacity-30",
        day_disabled: "text-n-4 opacity-50",
        day_range_middle:
          "aria-selected:bg-n-6 aria-selected:text-n-1",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar as DatePicker }
