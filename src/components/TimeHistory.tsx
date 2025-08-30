import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, Timer } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';

interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'checked_in' | 'completed';
}

export function TimeHistory() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState({
    totalHours: 0,
    completeDays: 0,
    averageDaily: 0,
    compliance: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/time-entries/history');
      if (response.success) {
        setEntries(response.entries || []);
        calculateWeeklyStats(response.entries || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyStats = (entries: TimeEntry[]) => {
    const completedEntries = entries.filter(entry => entry.totalHours);
    const totalHours = completedEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const completeDays = completedEntries.length;
    const averageDaily = completeDays > 0 ? totalHours / completeDays : 0;
    const targetHours = 40; // 8 hours x 5 days
    const compliance = (totalHours / targetHours) * 100;

    setWeeklyStats({
      totalHours: Math.round(totalHours * 10) / 10,
      completeDays,
      averageDaily: Math.round(averageDaily * 10) / 10,
      compliance: Math.round(compliance)
    });
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (entry: TimeEntry) => {
    if (entry.status === 'completed' && entry.totalHours) {
      return <Badge variant="default" className="text-xs">Completo</Badge>;
    } else if (entry.status === 'checked_in') {
      return <Badge variant="secondary" className="text-xs">En progreso</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">Incompleto</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historial de Registros</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Últimos 7 días
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-12 bg-muted rounded"></div>
                    <div className="flex gap-6">
                      <div className="w-16 h-8 bg-muted rounded"></div>
                      <div className="w-16 h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-muted rounded"></div>
                    <div className="w-20 h-6 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Timer className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Sin registros de tiempo</h3>
            <p className="text-sm text-muted-foreground">
              Comienza a fichar para ver tu historial aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
          <Card key={entry.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="font-medium">{formatDate(entry.date)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-mono">{formatTime(entry.checkIn)}</div>
                        <div className="text-xs text-muted-foreground">Entrada</div>
                      </div>
                    </div>
                    
                    {entry.checkOut ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="font-mono">{formatTime(entry.checkOut)}</div>
                          <div className="text-xs text-muted-foreground">Salida</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground opacity-50" />
                        <div className="text-sm">
                          <div className="text-muted-foreground">--:--</div>
                          <div className="text-xs text-muted-foreground">Salida</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {entry.totalHours ? (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <div className="text-right">
                        <div className="font-medium">{entry.totalHours}h</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground opacity-50" />
                      <div className="text-right">
                        <div className="text-muted-foreground">-</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                  )}
                  
                  {getStatusBadge(entry)}
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{weeklyStats.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Total trabajadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{weeklyStats.completeDays}</div>
              <div className="text-sm text-muted-foreground">Días completos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{weeklyStats.averageDaily}h</div>
              <div className="text-sm text-muted-foreground">Promedio diario</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{weeklyStats.compliance}%</div>
              <div className="text-sm text-muted-foreground">Cumplimiento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}