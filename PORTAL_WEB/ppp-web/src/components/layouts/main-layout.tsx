import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/custom/sidebar'

export function MainLayout() {
  const location = useLocation()
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath={location.pathname} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}