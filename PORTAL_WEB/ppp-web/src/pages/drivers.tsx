import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { formatCpf, formatPhone } from '@/lib/utils'

export default function Drivers() {
  // Mock data - será substituído por dados reais da API
  const drivers = [
    {
      id: '1',
      name: 'João Silva Santos',
      cpf: '12345678901',
      phone: '11987654321',
      email: 'joao.silva@empresa.com.br',
      status: 'active',
      currentVehicle: 'ABC-1234',
      lastActivity: '2025-09-17T08:30:00Z',
      totalHours: 1250,
      company: 'Transportes ABC'
    },
    {
      id: '2',
      name: 'Maria Santos Oliveira',
      cpf: '98765432109',
      phone: '11976543210',
      email: 'maria.santos@empresa.com.br',
      status: 'active',
      currentVehicle: 'DEF-5678',
      lastActivity: '2025-09-17T07:45:00Z',
      totalHours: 980,
      company: 'Transportes ABC'
    },
    {
      id: '3',
      name: 'Pedro Costa Lima',
      cpf: '45678901234',
      phone: '11965432109',
      email: 'pedro.costa@empresa.com.br',
      status: 'inactive',
      currentVehicle: null,
      lastActivity: '2025-09-15T18:20:00Z',
      totalHours: 750,
      company: 'Transportes ABC'
    },
    {
      id: '4',
      name: 'Ana Ferreira Souza',
      cpf: '78901234567',
      phone: '11954321098',
      email: 'ana.ferreira@empresa.com.br',
      status: 'active',
      currentVehicle: 'GHI-9012',
      lastActivity: '2025-09-17T09:15:00Z',
      totalHours: 1450,
      company: 'Transportes ABC'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const formatLastActivity = (date: string) => {
    return new Intl.RelativeTimeFormat('pt-BR').format(
      Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Motoristas</h1>
          <p className="text-muted-foreground">
            Gerencie os motoristas cadastrados na sua empresa
          </p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Cadastrar Novo Motorista</SheetTitle>
              <SheetDescription>
                Preencha as informações abaixo para cadastrar um novo motorista
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input placeholder="Digite o nome completo" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF</label>
                  <Input placeholder="000.000.000-00" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input type="email" placeholder="email@empresa.com.br" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Motorista</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nome, CPF ou email..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline">
              Status: Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Motoristas ({drivers.length})</span>
            <Button variant="outline" size="sm">
              Exportar CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div 
                key={driver.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Driver Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm">{driver.name}</h3>
                      {getStatusBadge(driver.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>CPF: {formatCpf(driver.cpf)}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {formatPhone(driver.phone)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {driver.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="text-sm font-medium">{driver.totalHours}h</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {driver.currentVehicle || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Veículo</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formatLastActivity(driver.lastActivity)}
                    </p>
                    <p className="text-xs text-muted-foreground">Última ativ.</p>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {driver.status === 'active' ? (
                      <DropdownMenuItem>
                        <UserX className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando 4 de 4 motoristas
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}