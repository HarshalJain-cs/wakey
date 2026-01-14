import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    const isToday = (day) => {
        const today = new Date();
        return (day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear());
    };
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (<div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title">📅 Calendar</span>
                <div className="flex items-center gap-1">
                    <button onClick={prevMonth} className="p-1 rounded hover:bg-dark-700 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-dark-400"/>
                    </button>
                    <span className="text-sm font-medium text-white px-2">
                        {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1 rounded hover:bg-dark-700 transition-colors">
                        <ChevronRight className="w-4 h-4 text-dark-400"/>
                    </button>
                </div>
            </div>

            <div className="mt-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {days.map((day) => (<div key={day} className="text-center text-xs font-medium text-dark-500 py-1">
                            {day}
                        </div>))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before first day of month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (<div key={`empty-${i}`} className="h-8"/>))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            return (<button key={day} className={`h-8 rounded-lg text-sm font-medium transition-all ${isToday(day)
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-300 hover:bg-dark-700'}`}>
                                {day}
                            </button>);
        })}
                </div>
            </div>

            {/* Events preview */}
            <div className="mt-4 pt-4 border-t border-dark-700">
                <div className="text-xs text-dark-400 mb-2">Upcoming</div>
                <div className="text-sm text-dark-300">No events scheduled</div>
            </div>
        </div>);
}
//# sourceMappingURL=CalendarWidget.js.map