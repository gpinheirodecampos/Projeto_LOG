
import { 
  Truck, 
  Clock, 
  Users, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/custom/metric-card'

export default function Dashboard() {
  // Mock data - será substituído por dados reais da API
  const metrics = {
    activeDrivers: 247,
    ongoingJourneys: 89,
    totalHours: 1850,
    pendingValidations: 12
  }

  const recentActivity = [
    {
      id: 1,
      type: 'shift_start',
      driver: 'João Silva',
      time: '08:30',
      description: 'Iniciou jornada - Veículo ABC-1234'
    },
    {
      id: 2,
      type: 'meal_end',
      driver: 'Maria Santos',
      time: '08:25',
      description: 'Finalizou refeição - 45min'
    },
    {
      id: 3,
      type: 'shift_end',
      driver: 'Pedro Costa',
      time: '08:20',
      description: 'Encerrou jornada - 8h30min trabalhadas'
    },
    {
      id: 4,
      type: 'rest_start',
      driver: 'Ana Lima',
      time: '08:15',
      description: 'Iniciou descanso obrigatório'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shift_start':
        return '🚛'
      case 'shift_end':
        return '🏁'
      case 'meal_start':
      case 'meal_end':
        return '🍽️'
      case 'rest_start':
      case 'rest_end':
        return '😴'
      default:
        return '📝'
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo da sua operação.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Hoje
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Motorista
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Motoristas Ativos"
          value={metrics.activeDrivers}
          change={12}
          icon={<Users className="h-6 w-6" />}
        />
        <MetricCard
          title="Jornadas em Andamento"
          value={metrics.ongoingJourneys}
          change={-3}
          icon={<Truck className="h-6 w-6" />}
        />
        <MetricCard
          title="Horas Trabalhadas (Mês)"
          value={`${metrics.totalHours}h`}
          change={8}
          icon={<Clock className="h-6 w-6" />}
        />
        <MetricCard
          title="Pendentes Validação"
          value={metrics.pendingValidations}
          change={-15}
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolução de Horas Trabalhadas
            </CardTitle>
            <CardDescription>
              Últimos 7 dias de operação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico será implementado com Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimos eventos registrados pelos motoristas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-2xl">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {activity.driver}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <Button variant="ghost" className="w-full">
                  Ver todas as atividades
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="h-2 w-2 bg-orange-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">3 motoristas com jornadas pendentes de validação</p>
                <p className="text-xs text-muted-foreground">Requer atenção do RH</p>
              </div>
              <Button size="sm" variant="outline">
                Revisar
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Relatório mensal disponível para download</p>
                <p className="text-xs text-muted-foreground">Setembro 2025 processado</p>
              </div>
              <Button size="sm" variant="outline">
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}