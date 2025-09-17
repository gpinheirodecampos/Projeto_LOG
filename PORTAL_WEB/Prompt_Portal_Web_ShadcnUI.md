# 🌐 PROMPT PARA DESIGN DE INTERFACE - PORTAL WEB ADMINISTRATIVO (shadcn/ui)

## CONTEXTO DO PROJETO
Você deve criar a interface de um **portal web administrativo** para empresas de logística gerenciarem motoristas, veículos, usuários e relatórios de diário de bordo digital. O portal é usado por administradores, gestores de frota e operadores de RH para controlar toda a operação.

**Público-alvo**: Administradores, gestores de frota, operadores de RH (idade 25-55 anos, familiarizados com sistemas web corporativos)
**Plataforma**: React + TypeScript + shadcn/ui + Tailwind CSS
**Funcionalidade principal**: Gestão completa de recursos e análise de dados operacionais

---

## REQUISITOS DE UX OBRIGATÓRIOS

### Princípios de Design
- **Design system moderno** - Interface clean com componentes shadcn/ui
- **Densidade de informação alta** - Muitos dados em layouts organizados
- **Navegação intuitiva** - Sidebar + breadcrumbs + tabs
- **Feedback claro** - Loading states, confirmações, toasts
- **Responsivo** - Desktop-first, tablet compatível  
- **Acessibilidade** - WCAG 2.1 AA, navegação por teclado
- **Performance** - Lazy loading, virtualized lists, otimizações

### Padrões Visuais shadcn/ui
- **Layout dashboard** - Sidebar fixa + header + conteúdo central
- **Cards elegantes** - Uso de Card, CardHeader, CardContent
- **Tabelas robustas** - DataTable com sorting, filtering, pagination
- **Formulários estruturados** - Form + Input + Label + validação
- **Dialogs para ações** - Sheet/Dialog para criar, editar, confirmações

---

## HIERARQUIA DE USUÁRIOS E ACESSO

### **Perfis de Usuário:**
1. **SuperAdmin** - Acesso total ao sistema
2. **CompanyAdmin** - Administrador da empresa  
3. **FleetManager** - Gestor de frota
4. **HROperator** - Operador de RH
5. **Supervisor** - Supervisor de operações

### **Controle de Acesso Visual:**
- **Menu lateral** adaptado por perfil de usuário
- **Botões de ação** habilitados/desabilitados por permissão
- **Seções condicionais** visíveis apenas para perfis específicos
- **Badge de perfil** visível no header

---

## STACK TECNOLÓGICA OBRIGATÓRIA

## ESTRUTURA DE PROJETO

```
src/
├── components/
│   ├── ui/                    # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── custom/                # Componentes customizados
│   │   ├── metric-card.tsx
│   │   ├── data-table.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   └── forms/                 # Formulários específicos
│       ├── driver-form.tsx
│       ├── vehicle-form.tsx
│       └── ...
├── pages/                     # Páginas principais
│   ├── dashboard.tsx
│   ├── drivers/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── vehicles/
│   └── reports/
├── hooks/                     # Hooks customizados
│   ├── use-auth.ts
│   ├── use-drivers.ts
│   └── use-permissions.ts
├── lib/                       # Utilitários
│   ├── utils.ts               # cn(), formatters
│   ├── api.ts                 # Cliente da API
│   └── validations.ts         # Schemas Zod
└── types/                     # Tipos TypeScript
    ├── api.ts
    ├── auth.ts
    └── entities.ts
```

---

## DELIVERABLES ESPERADOS

1. **Aplicação React + shadcn/ui completa** com todas as páginas
2. **Componentes shadcn/ui customizados** bem documentados  
3. **Hooks customizados** para operações CRUD
4. **Formulários com validação Zod** + react-hook-form
5. **Roteamento protegido** por permissões
6. **Responsividade** completa (desktop/tablet)
7. **Theme system** com modo dark/light
8. **Integração com API** usando TanStack Query
9. **Testes** unitários dos componentes principais
10. **Storybook** para documentação dos componentes

---

**IMPORTANTE**: Use EXCLUSIVAMENTE componentes do **shadcn/ui** como base, utilizando o mcp server. Customize através de **Tailwind CSS** e **CSS Variables**. Mantenha a **consistência visual** e **acessibilidade** em todos os componentes. O resultado deve ser uma aplicação **profissional, performática e escalável**. Comandos iniciais para a criação do projeto com react e vite já foram usados. Comando para instalar o shadcn também já foi usado.