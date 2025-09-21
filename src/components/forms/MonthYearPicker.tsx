import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  startDate?: string; // For end date validation
  disabled?: boolean; // To disable the picker
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, onChange, placeholder, label, startDate, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'calendar'>('month');
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.month-year-picker')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i);

  // Helper function to parse date strings
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    const parts = dateString.split('-');
    if (parts.length === 1) {
      // Year only (YYYY)
      return new Date(parseInt(parts[0]), 0, 1);
    } else if (parts.length === 2) {
      // Year and month (YYYY-MM)
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    } else if (parts.length === 3) {
      // Full date (YYYY-MM-DD)
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  };

  // Validation function for start dates
  const isValidStartDate = (selectedDate: Date): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Start date must be <= today
    if (selectedDate > today) {
      return false;
    }
    
    // Start date must be <= min(today, end date)
    if (startDate && label.toLowerCase().includes('start')) {
      // This is a start date field, so we need to check against existing end date
      const endDateObj = parseDate(startDate); // startDate parameter contains end date for start date validation
      if (endDateObj && selectedDate > endDateObj) {
        return false;
      }
    }
    
    return true;
  };

  // Validation function for end dates
  const isValidEndDate = (selectedDate: Date): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // End date must be <= today
    if (selectedDate > today) {
      return false;
    }
    
    // End date must be >= start date
    if (startDate) {
      const startDateObj = parseDate(startDate);
      if (startDateObj && selectedDate < startDateObj) {
        return false;
      }
    }
    
    return true;
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setSelectedMonth(monthIndex); // Track the selected month
    setViewMode('calendar'); // Automatically move to calendar view
  };

  const handleDateSelect = (day: number) => {
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const selectedDate = new Date(year, currentMonth, day);
    
    // Check if this is a start date field (label contains "Start")
    const isStartDate = label.toLowerCase().includes('start');
    
    if (isStartDate) {
      // Start date validation: must be <= min(today, end date)
      if (!isValidStartDate(selectedDate)) {
        return;
      }
    } else {
      // End date validation: must be >= start date and <= today
      if (!isValidEndDate(selectedDate)) {
        return;
      }
    }
    
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
    setViewMode('month');
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setShowYearDropdown(false);
    setViewMode('month'); // Automatically move to month selection
  };

  const formatDisplayValue = (dateString: string) => {
    if (!dateString) return placeholder;
    
    const parts = dateString.split('-');
    
    if (parts.length === 1) {
      // Only year selected (YYYY)
      return parts[0];
    } else if (parts.length === 2) {
      // Year and month selected (YYYY-MM)
      const [year, month] = parts;
      const monthIndex = parseInt(month) - 1;
      return `${months[monthIndex]} ${year}`;
    } else if (parts.length === 3) {
      // Year, month, and date selected (YYYY-MM-DD)
      const [year, month, day] = parts;
      const monthIndex = parseInt(month) - 1;
      return `${day} ${months[monthIndex]} ${year}`;
    }
    
    return dateString;
  };

  // Format header display based on current selection state
  const formatHeaderDisplay = () => {
    // When actively selecting (picker is open), prioritize current selection over saved value
    if (isOpen && selectedMonth !== null) {
      // If picker is open and month is selected, show selected month + year
      return `${months[selectedMonth]} ${currentYear}`;
    } else if (value) {
      // If there's a saved value and not actively selecting, show it
      return formatDisplayValue(value);
    } else if (selectedMonth !== null) {
      // If a month is selected but picker is closed, show selected month + year
      return `${months[selectedMonth]} ${currentYear}`;
    } else if (viewMode === 'month') {
      // In month view with no selection, show just the year
      return `${currentYear}`;
    } else {
      // Default: show just the year
      return `${currentYear}`;
    }
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push({
        date: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="relative month-year-picker">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-left flex items-center justify-between transition-all duration-200 ${
          disabled
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white/50 backdrop-blur-sm border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:bg-white/70 hover:border-gray-300'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {formatDisplayValue(value)}
        </span>
        <Calendar className="w-4 h-4 text-gray-500" />
      </button>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <>
          {/* Overlay to close picker when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {formatHeaderDisplay()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (showYearDropdown) {
                      // Close year dropdown and show month view
                      setShowYearDropdown(false);
                    } else {
                      // Open year dropdown and hide month view
                      setShowYearDropdown(true);
                      setViewMode('month'); // Ensure we're in month view when year dropdown closes
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Select year"
                >
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      showYearDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (showYearDropdown) {
                      setCurrentYear(prev => prev - 1);
                    } else if (viewMode === 'calendar' && selectedMonth !== null) {
                      // In calendar view, navigate through months while keeping selectedMonth
                      setCurrentMonth(prev => prev === 0 ? 11 : prev - 1);
                      if (currentMonth === 0) {
                        setCurrentYear(prev => prev - 1);
                      }
                    } else {
                      // In month view, navigate normally
                      setCurrentMonth(prev => prev === 0 ? 11 : prev - 1);
                      if (currentMonth === 0) {
                        setCurrentYear(prev => prev - 1);
                      }
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    showYearDropdown 
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={showYearDropdown ? "Previous year" : "Previous month"}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (showYearDropdown) {
                      setCurrentYear(prev => prev + 1);
                    } else if (viewMode === 'calendar' && selectedMonth !== null) {
                      // In calendar view, navigate through months while keeping selectedMonth
                      setCurrentMonth(prev => prev === 11 ? 0 : prev + 1);
                      if (currentMonth === 11) {
                        setCurrentYear(prev => prev + 1);
                      }
                    } else {
                      // In month view, navigate normally
                      setCurrentMonth(prev => prev === 11 ? 0 : prev + 1);
                      if (currentMonth === 11) {
                        setCurrentYear(prev => prev + 1);
                      }
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    showYearDropdown 
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={showYearDropdown ? "Next year" : "Next month"}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Year Dropdown */}
            {showYearDropdown && (
              <>
                {/* Overlay to close year dropdown when clicking outside */}
                <div className="fixed inset-0 z-25" onClick={() => setShowYearDropdown(false)} />
                <div className="relative z-30">
                  <div className="p-4 border-b border-gray-100">
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {years.map((year) => {
                        const isStartDate = label.toLowerCase().includes('start');
                        const selectedDate = new Date(year, 0, 1);
                        let isInvalidYear = false;
                        
                        if (isStartDate) {
                          // Start date: must be <= min(today, end date)
                          isInvalidYear = !isValidStartDate(selectedDate);
                        } else {
                          // End date: must be >= start date and <= today
                          isInvalidYear = !isValidEndDate(selectedDate);
                        }
                        
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => !isInvalidYear && handleYearSelect(year)}
                            disabled={isInvalidYear}
                            className={`w-full px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center ${
                              year === currentYear 
                                ? 'bg-blue-600 text-white font-medium' 
                                : isInvalidYear
                                  ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowYearDropdown(false)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(`${currentYear}`);
                          setIsOpen(false);
                          setShowYearDropdown(false);
                        }}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Month View - Only show when year dropdown is closed */}
            {viewMode === 'month' && !showYearDropdown && (
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {months.map((month, index) => {
                    const isStartDate = label.toLowerCase().includes('start');
                    const selectedDate = new Date(currentYear, index, 1);
                    let isInvalidMonth = false;
                    
                    if (isStartDate) {
                      // Start date: must be <= min(today, end date)
                      isInvalidMonth = !isValidStartDate(selectedDate);
                    } else {
                      // End date: must be >= start date and <= today
                      isInvalidMonth = !isValidEndDate(selectedDate);
                    }
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !isInvalidMonth && handleMonthSelect(index)}
                        disabled={isInvalidMonth}
                        className={`px-3 py-3 text-sm font-medium rounded-lg transition-colors border border-transparent flex items-center justify-center min-h-[40px] ${
                          isInvalidMonth
                            ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // If no month is selected, save only the year
                      // If month is selected, save year-month
                      const monthToSave = selectedMonth !== null ? String(selectedMonth + 1).padStart(2, '0') : '';
                      const valueToSave = monthToSave ? `${currentYear}-${monthToSave}` : `${currentYear}`;
                      onChange(valueToSave);
                      setIsOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Calendar View - Only show when year dropdown is closed */}
            {viewMode === 'calendar' && !showYearDropdown && (
              <div className="p-4">
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => {
                    const isStartDate = label.toLowerCase().includes('start');
                    const selectedDate = new Date(currentYear, currentMonth, day.date);
                    let isInvalidDate = false;
                    
                    if (isStartDate) {
                      // Start date: must be <= min(today, end date)
                      isInvalidDate = !isValidStartDate(selectedDate);
                    } else {
                      // End date: must be >= start date and <= today
                      isInvalidDate = !isValidEndDate(selectedDate);
                    }
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => day.isCurrentMonth && !isInvalidDate && handleDateSelect(day.date)}
                        disabled={!day.isCurrentMonth || isInvalidDate}
                        className={`w-8 h-8 text-sm rounded-md transition-colors flex items-center justify-center ${
                          day.isCurrentMonth && !isInvalidDate
                            ? 'text-gray-900 hover:bg-blue-50 hover:text-blue-700'
                            : 'text-gray-300 cursor-not-allowed'
                        } ${
                          day.isToday ? 'bg-blue-100 text-blue-700 font-medium' : ''
                        } ${
                          isInvalidDate ? 'opacity-50' : ''
                        }`}
                      >
                        {day.date}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // In calendar view, we always have year and month selected
                      // Save as year-month since no specific date was chosen
                      const year = currentYear;
                      const month = String(currentMonth + 1).padStart(2, '0');
                      onChange(`${year}-${month}`);
                      setIsOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthYearPicker;
