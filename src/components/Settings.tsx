import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Clock, 
  Save,
  Volume2,
  Calendar,
  User
} from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner';

interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    checkInReminder: boolean;
    checkOutReminder: boolean;
    breakReminder: boolean;
    soundEnabled: boolean;
  };
  workingHours: {
    startTime: string;
    endTime: string;
    breakDuration: number;
    workingDays: string[];
  };
  language: string;
  timezone: string;
}

const defaultSettings: SettingsData = {
  theme: 'system',
  notifications: {
    checkInReminder: true,
    checkOutReminder: true,
    breakReminder: false,
    soundEnabled: true
  },
  workingHours: {
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  language: 'es',
  timezone: 'Europe/Madrid'
};

const workingDayOptions = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/settings');
      if (response.success && response.settings) {
        setSettings({ ...defaultSettings, ...response.settings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await apiCall('/settings', {
        method: 'POST',
        body: JSON.stringify({ settings })
      });
      
      if (response.success) {
        toast.success('Configuración guardada correctamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        workingDays: prev.workingHours.workingDays.includes(day)
          ? prev.workingHours.workingDays.filter(d => d !== day)
          : [...prev.workingHours.workingDays, day]
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Configuración</h2>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Configuración</h2>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setSettings(prev => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Claro
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Oscuro
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      Sistema
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Recordatorio de entrada</Label>
                <p className="text-sm text-muted-foreground">
                  Te recordará cuando sea hora de fichar la entrada
                </p>
              </div>
              <Switch
                checked={settings.notifications.checkInReminder}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, checkInReminder: checked }
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Recordatorio de salida</Label>
                <p className="text-sm text-muted-foreground">
                  Te recordará cuando sea hora de fichar la salida
                </p>
              </div>
              <Switch
                checked={settings.notifications.checkOutReminder}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, checkOutReminder: checked }
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Recordatorio de descanso</Label>
                <p className="text-sm text-muted-foreground">
                  Te recordará tomar descansos regulares
                </p>
              </div>
              <Switch
                checked={settings.notifications.breakReminder}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, breakReminder: checked }
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Label>Sonidos activados</Label>
              </div>
              <Switch
                checked={settings.notifications.soundEnabled}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, soundEnabled: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Horario laboral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horario Laboral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de inicio</Label>
                <Input
                  type="time"
                  value={settings.workingHours.startTime}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, startTime: e.target.value }
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de fin</Label>
                <Input
                  type="time"
                  value={settings.workingHours.endTime}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, endTime: e.target.value }
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duración del descanso (minutos)</Label>
              <Input
                type="number"
                min="0"
                max="120"
                value={settings.workingHours.breakDuration}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    workingHours: { 
                      ...prev.workingHours, 
                      breakDuration: parseInt(e.target.value) || 0 
                    }
                  }))
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Días laborables</Label>
              <div className="flex flex-wrap gap-2">
                {workingDayOptions.map(day => (
                  <Badge
                    key={day.value}
                    variant={settings.workingHours.workingDays.includes(day.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleWorkingDay(day.value)}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Localización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zona horaria</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                    <SelectItem value="America/New_York">Nueva York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}