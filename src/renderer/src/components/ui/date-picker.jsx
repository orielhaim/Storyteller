import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function DatePicker({ value, onChange, placeholder = "Select date", className = "" }) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState(value ? new Date(value) : undefined)
  const [month, setMonth] = React.useState(date)
  const [inputValue, setInputValue] = React.useState(formatDate(date))

  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value)
      setDate(newDate)
      setMonth(newDate)
      setInputValue(formatDate(newDate))
    } else {
      setDate(undefined)
      setMonth(undefined)
      setInputValue("")
    }
  }, [value])

  const handleInputChange = (e) => {
    const inputVal = e.target.value.trim()
    setInputValue(e.target.value) // Keep the actual input value for display

    // If input is empty, clear the date
    if (inputVal === "") {
      setDate(undefined)
      setMonth(undefined)
      onChange?.(null) // Send null to clear the date
      return
    }

    const parsedDate = new Date(inputVal)
    if (isValidDate(parsedDate)) {
      setDate(parsedDate)
      setMonth(parsedDate)
      onChange?.(parsedDate.toISOString().split('T')[0]) // Send date in YYYY-MM-DD format
    }
  }

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate)
    setInputValue(formatDate(selectedDate))
    setOpen(false)
    onChange?.(selectedDate.toISOString().split('T')[0]) // Send date in YYYY-MM-DD format
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        placeholder={placeholder}
        className={`bg-background pr-10 ${className}`}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}