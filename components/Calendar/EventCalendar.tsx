import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InternalEvent } from '../../types/internalEvent';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface EventCalendarProps {
  events: InternalEvent[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  // Adjust startingDay to suit Arabic (Sunday start) if needed, 
  // standard JS getDay() returns 0 for Sunday.
  const startingDay = firstDayOfMonth.getDay();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: number): InternalEvent[] => {
    // Format: YYYY-MM-DD
    // Note: Month is 0-indexed in JS Date, so month + 1.
    // We need to ensure zero-padding for matching string comparison.
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;
    
    return events.filter(e => e.date === dateStr);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-400',
      scheduled: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-orange-500',
      documented: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const todayDate = new Date();
      const isToday = 
        todayDate.getDate() === day &&
        todayDate.getMonth() === month &&
        todayDate.getFullYear() === year;

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 overflow-y-auto ${isToday ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white'}`}
        >
          <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <Link
                key={event.id}
                to={`/school/internal-events/${event.id}`}
                className={`block text-xs px-1.5 py-0.5 rounded text-white truncate shadow-sm hover:opacity-80 transition ${getStatusColor(event.status)}`}
                title={event.title}
              >
                {event.recurrence !== 'none' && '🔄 '}
                {event.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"><FaChevronRight /></button>
          <button onClick={goToToday} className="px-3 py-1 text-sm bg-teal-100 text-teal-700 font-medium rounded-lg hover:bg-teal-200 transition">اليوم</button>
          <button onClick={goToNextMonth} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"><FaChevronLeft /></button>
        </div>
        <h2 className="text-lg font-bold text-gray-900">{monthNames[month]} {year}</h2>
      </div>

      {/* Legend */}
      <div className="flex gap-4 p-3 bg-white border-b border-gray-200 text-xs flex-wrap justify-center sm:justify-start">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> مسودة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> مجدولة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> قيد التنفيذ</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> مكتملة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> موثقة</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> ملغاة</span>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="py-2 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {renderDays()}
      </div>
    </div>
  );
};

export default EventCalendar;