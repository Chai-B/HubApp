"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-row space-x-4 justify-center w-full",
        month: "space-x-4 w-full",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-semibold text-[#8B5C2A] font-sans w-full text-center",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-[#8B5C2A] font-sans",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-center w-full",
        head_cell:
          "text-[#8B5C2A] !opacity-100 font-sans font-semibold rounded-md w-10 text-base text-center",
        row: "flex w-full mt-2 justify-center",
        cell: "h-10 w-10 text-center text-base p-0 relative font-sans focus-within:relative focus-within:z-20",
        day: "h-10 w-10 p-0 font-sans font-semibold text-[#8B5C2A] rounded-md transition border-2 border-transparent aria-selected:opacity-100 text-center flex items-center justify-center text-base",
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#F5E9DE] text-[#8B5C2A] border-[#8B5C2A] border-2 font-bold",
        day_today: "bg-transparent text-[#8B5C2A] font-bold",
        day_outside:
          "day-outside text-[#E2CDB0] !opacity-100",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
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

export { Calendar }
