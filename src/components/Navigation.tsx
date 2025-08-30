import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Home, 
  Clock, 
  BarChart3, 
  Calendar, 
  Settings, 
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'history', label: 'Historial', icon: Clock },
    { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <Card className={`h-full flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">TimeTracker</h2>
              <p className="text-xs text-muted-foreground">Control horario</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{getDisplayName()}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                Activo
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isCollapsed ? 'px-0 justify-center' : 'px-3'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Items */}
      <div className="p-2 border-t">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start h-10 ${
                  isCollapsed ? 'px-0 justify-center' : 'px-3'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Button>
            );
          })}
          
          <Button
            variant="ghost"
            className={`w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10 ${
              isCollapsed ? 'px-0 justify-center' : 'px-3'
            }`}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && (
              <span className="ml-3">Cerrar Sesión</span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}