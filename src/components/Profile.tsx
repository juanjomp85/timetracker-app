import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Clock,
  Target,
  Award,
  Upload,
  Save
} from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  bio: string;
  avatar: string;
  startDate: string;
  employeeId: string;
}

interface ProfileStats {
  totalHours: number;
  daysWorked: number;
  averageDaily: number;
  punctualityScore: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedDate: string;
    icon: string;
  }>;
}

const defaultProfile: UserProfile = {
  id: 'default',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  location: '',
  bio: '',
  avatar: '',
  startDate: '',
  employeeId: ''
};

export function Profile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [stats, setStats] = useState<ProfileStats>({
    totalHours: 0,
    daysWorked: 0,
    averageDaily: 0,
    punctualityScore: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
    loadProfileStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/profile');
      if (response.success && response.profile) {
        setProfile({ ...defaultProfile, ...response.profile });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileStats = async () => {
    try {
      const response = await apiCall('/profile/stats');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading profile stats:', error);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const uploadResponse = await apiCall('/profile/avatar', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.success) {
          setProfile(prev => ({ ...prev, avatar: uploadResponse.avatarUrl }));
        }
      }

      const response = await apiCall('/profile', {
        method: 'POST',
        body: JSON.stringify({ profile })
      });
      
      if (response.success) {
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: previewUrl }));
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Mi Perfil</h2>
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
          <User className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Mi Perfil</h2>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>
                      {getInitials(profile.firstName, profile.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                    <Upload className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label>Apellidos</Label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </Label>
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+34 123 456 789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Biografía</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Cuéntanos algo sobre ti..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Cargo
                  </Label>
                  <Input
                    value={profile.position}
                    onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Tu cargo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Input
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Tu departamento"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación
                  </Label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Tu ubicación"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de inicio
                  </Label>
                  <Input
                    type="date"
                    value={profile.startDate}
                    onChange={(e) => setProfile(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ID de empleado</Label>
                <Input
                  value={profile.employeeId}
                  onChange={(e) => setProfile(prev => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="EMP001"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">{stats.totalHours}h</div>
                <p className="text-sm text-muted-foreground">Total trabajadas</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Días trabajados</span>
                  <span className="font-medium">{stats.daysWorked}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Media diaria</span>
                  <span className="font-medium">{stats.averageDaily}h</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Puntualidad</span>
                  <span className="text-sm font-medium">{stats.punctualityScore}%</span>
                </div>
                <Progress value={stats.punctualityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Logros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.achievements.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sigue trabajando para conseguir tus primeros logros
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}