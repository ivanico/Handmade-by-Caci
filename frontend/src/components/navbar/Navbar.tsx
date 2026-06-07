import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import NavbarCartIcon from './Navbar.CartIcon';
import NavbarMobileMenu from './Navbar.MobileMenu';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  'text-sm font-medium transition-colors ' +
  (isActive ? 'text-primary-dark' : 'text-gray-500 hover:text-gray-900');

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <img
            src="/Handmade-by-Caci-logo.png"
            alt="Handmade by Caci"
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-8">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            Catalog
          </NavLink>
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          <NavbarCartIcon />

          <div className="hidden md:flex items-center gap-3 ml-2">
            {user ? (
              <>
                <span className="text-sm text-gray-600 max-w-[120px] truncate">
                  {user.full_name || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md active:scale-95 transition-all duration-150 font-medium inline-flex items-center justify-center px-3 py-1.5 text-sm bg-primary hover:bg-primary-dark text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <NavbarMobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
