import React from 'react';
import { isDateInPast } from '../utils/dateUtils';

const Calendar = ({ days, selectedDate, onDateSelect, appointments }) => {
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekdays.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dateKey = day.date.toISOString().split('T')[0];
          const dayAppointments = appointments[dateKey] || [];
          const hasAppointments = dayAppointments.length > 0;
          const isPast = isDateInPast(day.date);
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
          
          return (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && onDateSelect(day.date)}
              disabled={!day.isCurrentMonth}
              className={`
                h-12 w-12 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
                ${day.isCurrentMonth 
                  ? isPast 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : hasAppointments
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : isSelected
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {day.date.getDate()}
              {hasAppointments && (
                <div className="flex justify-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {dayAppointments.length > 1 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;