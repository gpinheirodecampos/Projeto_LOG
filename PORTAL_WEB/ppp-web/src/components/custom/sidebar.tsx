import { Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Truck, 
  Car, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from './theme-toggle'

interface SidebarProps {
  currentPath?: string
}

export function Sidebar({ currentPath = '/dashboard' }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Menu items com controle de permissões (será implementado depois)
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      permission: null
    },
    {
      title: 'Motoristas', 
      icon: Truck,
      href: '/drivers',
      permission: 'drivers.read'
    },
    {
      title: 'Veículos',
      icon: Car,
      href: '/vehicles', 
      permission: 'vehicles.read'
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      href: '/reports',
      permission: 'reports.view'
    },
    {
      title: 'Usuários',
      icon: Users,
      href: '/users',
      permission: 'users.read'
    },
    {
      title: 'Configurações',
      icon: Settings,
      href: '/settings',
      permission: 'system.settings'
    }
  ]

  const isActive = (href: string) => currentPath === href

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Portal Admin</h1>
            <p className="text-xs text-muted-foreground">Diário de Bordo</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "secondary" : "ghost"}
            className={`w-full justify-start h-10 ${
              isActive(item.href) 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                : 'hover:bg-sidebar-accent text-sidebar-foreground'
            }`}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="mr-3 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        ))}
      </nav>
      
      {/* User Menu */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-2 hover:bg-sidebar-accent"
            >
              <Avatar className="mr-3 h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left flex-1">
                <p className="text-sm font-medium leading-tight">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">{user?.role || 'Função'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}