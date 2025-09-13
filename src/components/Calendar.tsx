import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
// Removed CalendarComponent import - using custom calendar
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { useRefresh } from '../contexts/RefreshContext';
import { useAuth } from '../contexts/AuthContext';
import { toLocalDateString } from '../utils/dateUtils';

interface CalendarEntry {
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status: 'completed' | 'incomplete' | 'absent';
}

interface CalendarStats {
  totalDays: number;
  workDays: number;
  completeDays: number;
  averageHours: number;
  totalHours: number;
}

export function Calendar() {
  const { user } = useAuth();
  const { refreshHistory } = useRefresh();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CalendarStats>({
    totalDays: 0,
    workDays: 0,
    completeDays: 0,
    averageHours: 0,
    totalHours: 0
  });

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [currentMonth, user]);

  // Reload calendar data when refreshHistory changes
  useEffect(() => {
    if (refreshHistory > 0 && user) {
      loadCalendarData();
    }
  }, [refreshHistory]);

  useEffect(() => {
    const entry = entries.find(e => e.date === toLocalDateString(selectedDate));
    setSelectedEntry(entry || null);
  }, [selectedDate, entries]);

  const loadCalendarData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await apiCall(
        `/time-entries/calendar?userId=${user.id}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      
      if (response.success) {
        setEntries(response.entries || []);
        calculateStats(response.entries || []);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: CalendarEntry[]) => {
    const workDays = entries.length;
    const completeDays = entries.filter(e => e.status === 'completed').length;
    const totalHours = entries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
    const averageHours = completeDays > 0 ? totalHours / completeDays : 0;

    setStats({
      totalDays: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(),
      workDays,
      completeDays,
      averageHours: Math.round(averageHours * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'incomplete': return 'Incompleto';
      case 'absent': return 'Ausente';
      default: return 'Sin datos';
    }
  };

  const currentMonthName = currentMonth.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Custom calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const getLastDayOfPreviousMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return selectedDate.getDate() === date.getDate() &&
           selectedDate.getMonth() === date.getMonth() &&
           selectedDate.getFullYear() === date.getFullYear();
  };

  const getDateStatus = (date: Date) => {
    const dateStr = toLocalDateString(date);
    const entry = entries.find(e => e.date === dateStr);
    return entry?.status || 'absent';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'incomplete': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const lastDayOfPrevMonth = getLastDayOfPreviousMonth(currentMonth);
    
    const days = [];
    
    // Add days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth - i;
      days.push(
        <div key={`prev-${day}`} className="h-12 flex items-center justify-center text-gray-400 text-sm">
          {day}
        </div>
      );
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const status = getDateStatus(date);
      const isCurrentDay = isToday(date);
      const isSelectedDay = isSelected(date);
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            h-12 w-full flex items-center justify-center text-sm font-medium rounded-lg border-2 transition-all duration-200 hover:scale-105
            ${isCurrentDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            ${isSelectedDay ? 'ring-2 ring-primary ring-offset-2' : ''}
            ${getStatusColor(status)}
          `}
        >
          {day}
        </button>
      );
    }
    
    // Add days from next month to fill the grid
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="h-12 flex items-center justify-center text-gray-400 text-sm">
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Calendario</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[180px] text-center">
            {currentMonthName}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Días trabajados</p>
                <p className="text-2xl font-bold">{stats.workDays}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Días completos</p>
                <p className="text-2xl font-bold">{stats.completeDays}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total horas</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Media diaria</p>
                <p className="text-2xl font-bold">{stats.averageHours}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vista de Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">{currentMonthName}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                    <span>Completado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                    <span>Incompleto</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></div>
                    <span>Sin registro</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Day Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center pb-4 border-b">
              <h3 className="font-medium">{formatDate(selectedDate)}</h3>
              <Badge 
                variant={selectedEntry?.status === 'completed' ? 'default' : 'secondary'}
                className="mt-2"
              >
                {selectedEntry ? getStatusText(selectedEntry.status) : 'Sin registro'}
              </Badge>
            </div>

            {selectedEntry ? (
              <div className="space-y-4">
                {selectedEntry.checkIn && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Entrada:</span>
                    <span className="font-mono">{formatTime(selectedEntry.checkIn)}</span>
                  </div>
                )}
                
                {selectedEntry.checkOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Salida:</span>
                    <span className="font-mono">{formatTime(selectedEntry.checkOut)}</span>
                  </div>
                )}
                
                {selectedEntry.totalHours && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Total trabajado:</span>
                    <span className="font-bold">{selectedEntry.totalHours}h</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No hay registros para este día
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}