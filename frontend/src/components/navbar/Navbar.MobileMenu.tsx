import { Link, NavLink } from 'react-router-dom';
import type { User } from '@/types/common';
import Button from '@/components/ui/Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  'block py-2 text-base font-medium transition-colors ' +
  (isActive ? 'text-primary-dark' : 'text-gray-500 hover:text-gray-900');

export default function NavbarMobileMenu({ isOpen, onClose, user, onLogout }: Props) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <span className="font-heading text-gray-900">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink to="/" end className={navLinkClass} onClick={onClose}>
            Home
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass} onClick={onClose}>
            Catalog
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-border space-y-2">
          {user ? (
            <>
              <p className="text-sm text-gray-500 truncate">{user.full_name || user.email}</p>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="block text-sm text-gray-700 hover:text-gray-900 transition-colors py-1"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block text-center rounded-md active:scale-95 transition-all duration-150 font-medium px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
