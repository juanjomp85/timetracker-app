import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Calendar, Timer, TrendingUp } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'checked_in' | 'completed';
}

export function Dashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayEntry, setTodayEntry] = useState<TimeEntry | null>(null);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [monthlyHours, setMonthlyHours] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodayEntry();
    loadAnalytics();
  }, []);

  const loadTodayEntry = async () => {
    if (!user) return;
    try {
      const response = await apiCall(`/time-entries/today?userId=${user.id}`);
      if (response.success && response.entry) {
        setTodayEntry(response.entry);
        setIsCheckedIn(response.entry.status === 'checked_in');
      }
    } catch (error) {
      console.error('Error loading today entry:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;
    try {
      const response = await apiCall(`/analytics?userId=${user.id}`);
      if (response.success) {
        setWeeklyHours(response.analytics.weeklyHours);
        setMonthlyHours(response.analytics.monthlyHours);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCheckIn = async () => {
    if (loading || !user) return;
    
    setLoading(true);
    try {
      const response = await apiCall('/time-entries', {
        method: 'POST',
        body: JSON.stringify({ action: 'check_in', userId: user.id })
      });
      
      if (response.success) {
        setTodayEntry(response.entry);
        setIsCheckedIn(true);
        await loadAnalytics(); // Refresh stats
      } else {
        console.error('Check-in failed:', response.error);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (loading || !user) return;
    
    setLoading(true);
    try {
      const response = await apiCall('/time-entries', {
        method: 'POST',
        body: JSON.stringify({ action: 'check_out', userId: user.id })
      });
      
      if (response.success) {
        setTodayEntry(response.entry);
        setIsCheckedIn(false);
        await loadAnalytics(); // Refresh stats
      } else {
        console.error('Check-out failed:', response.error);
      }
    } catch (error) {
      console.error('Error during check-out:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Control de Horario</h1>
        <p className="text-muted-foreground">{formatDate(currentTime)}</p>
        <div className="text-4xl font-mono font-bold text-primary">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Status Card */}
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Timer className="h-5 w-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge 
              variant={isCheckedIn ? "default" : "secondary"} 
              className="text-sm px-4 py-2"
            >
              {isCheckedIn ? "Trabajando" : "Fuera del trabajo"}
            </Badge>
          </div>
          
          {todayEntry && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Entrada:</span>
<span className="font-mono">{new Date(todayEntry.checkIn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {todayEntry.checkOut && (
                <>
                  <div className="flex justify-between">
                    <span>Salida:</span>
<span className="font-mono">{new Date(todayEntry.checkOut).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Horas trabajadas:</span>
                    <span>{todayEntry.totalHours}h</span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {!isCheckedIn ? (
<Button 
                onClick={handleCheckIn} 
                className="flex-1"
                size="lg"
                disabled={loading}
              >
{loading ? (
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Procesando...' : 'Fichar Entrada'}
              </Button>
            ) : (
<Button 
                onClick={handleCheckOut} 
                variant="outline" 
                className="flex-1"
                size="lg"
                disabled={loading}
              >
{loading ? (
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Procesando...' : 'Fichar Salida'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayEntry?.totalHours || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              Horas trabajadas hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyHours}h</div>
            <p className="text-xs text-muted-foreground">
              +2.5h desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyHours}h</div>
            <p className="text-xs text-muted-foreground">
              Meta: 160h (91% completado)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}