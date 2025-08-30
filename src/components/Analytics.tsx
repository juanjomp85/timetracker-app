import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Calendar, Target } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';

export function Analytics() {
  const [analytics, setAnalytics] = useState({
    weeklyHours: 0,
    monthlyHours: 0,
    dailyStats: [],
    totalEntries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/analytics');
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyTarget = 40;
  const avgDailyHours = analytics.weeklyHours / 5;
  const completionPercentage = Math.round((analytics.weeklyHours / weeklyTarget) * 100);
  const completeDays = analytics.dailyStats.filter(day => day.hours >= 7).length;
  
  // Mock data for additional charts (to be replaced with real data)
  const monthlyTrend = [
    { week: 'S1', hours: analytics.monthlyHours * 0.2 },
    { week: 'S2', hours: analytics.monthlyHours * 0.25 },
    { week: 'S3', hours: analytics.monthlyHours * 0.3 },
    { week: 'S4', hours: analytics.weeklyHours },
  ];

  const projectDistribution = [
    { name: 'Trabajo General', hours: analytics.weeklyHours * 0.7, color: '#0088FE' },
    { name: 'Reuniones', hours: analytics.weeklyHours * 0.15, color: '#00C49F' },
    { name: 'Capacitación', hours: analytics.weeklyHours * 0.1, color: '#FFBB28' },
    { name: 'Otros', hours: analytics.weeklyHours * 0.05, color: '#FF8042' },
  ].filter(item => item.hours > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análisis de Tiempo</h2>
        <Badge variant="outline" className="text-sm">
          Semana actual
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Semanales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : analytics.weeklyHours}h</div>
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
<div className="text-2xl font-bold">{loading ? '-' : avgDailyHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Objetivo: 8h diarias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días Completos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
<div className="text-2xl font-bold">{loading ? '-' : `${completeDays}/5`}</div>
            <p className="text-xs text-muted-foreground">
              Días con 8+ horas
            </p>
          </CardContent>
        </Card>
      </div>

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
                      innerRadius={60}
                      outerRadius={100}
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

            <Card>
              <CardHeader>
                <CardTitle>Desglose por Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectDistribution.map((project, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm font-medium">{project.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{project.hours}h</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((project.hours / 130) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}