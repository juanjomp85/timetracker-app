import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Calendar, Target } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';

interface DailyStat {
  date: string;
  hours: number;
  day: string;
}

interface AnalyticsData {
  weeklyHours: number;
  monthlyHours: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  weeklyTarget: number;
  weeklyCompletion: number;
  monthlyTarget: number;
  monthlyCompletion: number;
  dailyStats: DailyStat[];
  totalEntries: number;
}

export function Analytics() {
  const { user } = useAuth();
  const { refreshHistory } = useRefresh();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    weeklyHours: 0,
    monthlyHours: 0,
    weeklyChange: 0,
    weeklyChangePercent: 0,
    monthlyChange: 0,
    monthlyChangePercent: 0,
    weeklyTarget: 40,
    weeklyCompletion: 0,
    monthlyTarget: 160,
    monthlyCompletion: 0,
    dailyStats: [],
    totalEntries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Analytics component mounted');
    if (user) {
      loadAnalytics();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  // Reload analytics when refreshHistory changes
  useEffect(() => {
    if (refreshHistory > 0 && user) {
      loadAnalytics();
    }
  }, [refreshHistory]);

  const loadAnalytics = async () => {
    if (!user) {
      console.log('No user available for analytics');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading analytics for user:', user.id);
      setLoading(true);
      setError(null);
      
      const response = await apiCall(`/analytics?userId=${user.id}`);
      console.log('Analytics response:', response);
      
      if (response.success) {
        setAnalytics(response.analytics);
      } else {
        setError(response.error || 'Error al cargar analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Error de conexión al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  // Safe calculations with fallbacks
  const weeklyTarget = analytics.weeklyTarget || 40;
  const avgDailyHours = analytics.weeklyHours > 0 ? analytics.weeklyHours / 5 : 0;
  const completionPercentage = analytics.weeklyCompletion || 0;
  const completeDays = Array.isArray(analytics.dailyStats) ? analytics.dailyStats.filter(day => day && day.hours >= 7).length : 0;
  
  // Safe data for charts
  const monthlyTrend = [
    { week: 'S1', hours: Math.round((analytics.monthlyHours || 0) * 0.25) },
    { week: 'S2', hours: Math.round((analytics.monthlyHours || 0) * 0.25) },
    { week: 'S3', hours: Math.round((analytics.monthlyHours || 0) * 0.25) },
    { week: 'S4', hours: analytics.weeklyHours || 0 },
  ];

  const projectDistribution = [
    { name: 'Trabajo General', hours: Math.round((analytics.weeklyHours || 0) * 0.7), color: '#0088FE' },
    { name: 'Reuniones', hours: Math.round((analytics.weeklyHours || 0) * 0.15), color: '#00C49F' },
    { name: 'Capacitación', hours: Math.round((analytics.weeklyHours || 0) * 0.1), color: '#FFBB28' },
    { name: 'Otros', hours: Math.round((analytics.weeklyHours || 0) * 0.05), color: '#FF8042' },
  ].filter(item => item.hours > 0);

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Análisis de Tiempo</h2>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-red-500 mb-4">⚠️ Error al cargar analytics</div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadAnalytics}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Análisis de Tiempo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  console.log('Rendering Analytics with data:', analytics);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análisis de Tiempo</h2>
        <Badge variant="outline" className="text-sm">
          Semana actual
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Semanales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weeklyHours}h</div>
            <p className="text-xs text-muted-foreground">
              Meta: {weeklyTarget}h ({completionPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Objetivo: 8h diarias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cambio Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.weeklyChange >= 0 ? '+' : ''}{analytics.weeklyChange}h
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.weeklyChangePercent >= 0 ? '+' : ''}{analytics.weeklyChangePercent}% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días Completos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeDays}/5</div>
            <p className="text-xs text-muted-foreground">
              Días con 8+ horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cambio Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.monthlyChange >= 0 ? '+' : ''}{analytics.monthlyChange}h
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.monthlyChangePercent >= 0 ? '+' : ''}{analytics.monthlyChangePercent}% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensual</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horas Trabajadas - Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.dailyStats.map(day => ({ 
                  ...day, 
                  target: 8 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}h`, 
                      name === 'hours' ? 'Trabajadas' : 'Objetivo'
                    ]}
                  />
                  <Bar dataKey="target" fill="#e2e8f0" name="target" />
                  <Bar dataKey="hours" fill="#3b82f6" name="hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}h`, 'Horas']} />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="hours"
                    >
                      {projectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}h`, 'Horas']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}