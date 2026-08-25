import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <AppSidebar />
      <div className="lg:pl-[260px]">
        <AppHeader />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
