"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, isValid, parse, startOfDay } from "date-fns" // וודא שהתקנת את date-fns

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// רשימת פורמטים שהמערכת תנסה לזהות כשהמשתמש מקליד ידנית
const DATE_FORMATS_TO_TRY = [
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "dd.MM.yyyy",
  "d/M/yyyy",
  "d.M.yyyy",
  "dd/MM/yy",
  "d/M/yy",
  "yyyy-MM-dd", // ISO format
]

// הפורמט שיוצג בתוך האינפוט לאחר בחירה
const DISPLAY_FORMAT = "dd/MM/yyyy"

export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
}) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // --- 1. המרה בטוחה של הערך הנכנס (תיקון באג "יום אחורה") ---
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    
    // אם קיבלנו מחרוזת, ננסה להמיר אותה לתאריך מקומי ללא השפעת אזורי זמן
    let dateObj = typeof value === 'string' ? new Date(value) : value;

    if (isValid(dateObj)) {
        // הטריק: אנחנו לוקחים את התאריך ומאפסים אותו לחצות של הזמן המקומי של המשתמש
        // זה מונע תזוזות של ימים בגלל UTC
        return startOfDay(dateObj)
    }
    return undefined
  }, [value])


  // --- 2. עדכון האינפוט כשהערך החיצוני משתנה ---
  React.useEffect(() => {
    if (selectedDate) {
      setInputValue(format(selectedDate, DISPLAY_FORMAT))
    } else {
      setInputValue("")
    }
  }, [selectedDate])


  // --- 3. לוגיקה חכמה לזיהוי הקלדת המשתמש ---
  const handleInputChange = (e) => {
    const newVal = e.target.value
    setInputValue(newVal)

    if (!newVal.trim()) {
      onChange?.(undefined)
      return
    }

    // ניסיון לפרסר את הטקסט לפי רשימת הפורמטים
    let parsedDate;

    for (const fmt of DATE_FORMATS_TO_TRY) {
      const result = parse(newVal, fmt, new Date())
      if (isValid(result) && result.getFullYear() > 1900) {
        parsedDate = startOfDay(result)
        break
      }
    }

    if (parsedDate) {
      onChange?.(parsedDate)
    }
  }

  const handleBlur = () => {
    if (selectedDate) {
        setInputValue(format(selectedDate, DISPLAY_FORMAT))
    } else if (inputValue.trim() !== "") {
        // אם המשתמש כתב ג'יבריש ואין תאריך נבחר, ננקה או נשאיר (לבחירתך, כאן אני מנקה)
        setInputValue("")
    }
  }

  const handleCalendarSelect = (date) => {
    if (!date) {
        onChange?.(undefined)
        setInputValue("")
        return
    }
    const normalized = startOfDay(date)
    onChange?.(normalized)
    setInputValue(format(normalized, DISPLAY_FORMAT))
    setOpen(false)
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="pr-10"
        autoComplete="off"
      />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
            tabIndex={-1} // כדי שהטאב לא יעצור על הכפתור אלא רק על האינפוט
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            defaultMonth={selectedDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}