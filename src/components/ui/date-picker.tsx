// src/components/ui/date-picker.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date | null;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", disabled }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value || undefined);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
      setDate(value || undefined);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      onChange(selectedDate);
      setIsOpen(false); // Close popover on date select
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={disabled} // Pass disabled prop to Calendar
        />
      </PopoverContent>
    </Popover>
  )
}