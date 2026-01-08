import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BirthDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  minAge?: number;
  maxAge?: number;
}

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function BirthDatePicker({
  value,
  onChange,
  minAge = 13,
  maxAge = 100,
}: BirthDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - maxAge;
  const maxYear = currentYear - minAge;

  // Parse existing value
  const [day, setDay] = React.useState<string>("");
  const [month, setMonth] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");

  // Initialize from value prop
  React.useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [value]);

  // Generate years array (descending)
  const years = React.useMemo(() => {
    const arr: string[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      arr.push(y.toString());
    }
    return arr;
  }, [minYear, maxYear]);

  // Generate days array based on selected month/year
  const days = React.useMemo(() => {
    const numDays = month && year 
      ? getDaysInMonth(parseInt(month), parseInt(year))
      : 31;
    return Array.from({ length: numDays }, (_, i) => 
      (i + 1).toString().padStart(2, "0")
    );
  }, [month, year]);

  // Update parent when all fields are filled
  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    if (newDay && newMonth && newYear) {
      // Validate day for the month
      const maxDays = getDaysInMonth(parseInt(newMonth), parseInt(newYear));
      const validDay = parseInt(newDay) > maxDays 
        ? maxDays.toString().padStart(2, "0") 
        : newDay;
      
      if (validDay !== newDay) {
        setDay(validDay);
      }
      
      onChange(`${newYear}-${newMonth}-${validDay}`);
    }
  };

  const handleDayChange = (val: string) => {
    setDay(val);
    updateDate(val, month, year);
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    updateDate(day, val, year);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    updateDate(day, month, val);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={day} onValueChange={handleDayChange}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month} onValueChange={handleMonthChange}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
