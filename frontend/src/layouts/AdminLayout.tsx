import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-white shadow-sm border-r border-border text-gray-700 flex flex-col fixed inset-y-0 left-0">
        <div className="px-6 py-5 border-b border-border">
          <img
            src="/Handmade-by-Caci-logo.png"
            alt="Handmade by Caci"
            className="h-10 w-auto"
          />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ' +
                (isActive
                  ? 'bg-primary-light text-primary-dark'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs text-gray-400 truncate mb-2">
            {user?.full_name || user?.email}
          </p>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-60 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
