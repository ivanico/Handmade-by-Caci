import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { catalogApi } from '@/features/catalog/api/catalogApi';
import Button from '@/components/ui/Button';
import NavbarCartIcon from './Navbar.CartIcon';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  'text-sm font-medium whitespace-nowrap transition-colors ' +
  'after:content-[\'\'] after:block after:h-px after:bg-primary after:transition-transform after:duration-200 ' +
  'after:scale-x-0 hover:after:scale-x-100 ' +
  (isActive ? 'text-gray-900' : 'text-gray-800 hover:text-gray-600');

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  'block py-2 text-base font-medium transition-colors ' +
  (isActive ? 'text-primary-dark' : 'text-gray-500 hover:text-gray-900');

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/login', { replace: true });
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <>
      {/*
        Outer wrapper: fixed full-width, pointer-events-none so the transparent
        area beside the pill doesn't eat page clicks.
        AnimatePresence is a SIBLING (not child) of motion.div — framer-motion's
        transform creates a stacking context that breaks nested fixed positioning.
      */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <motion.div
          className="w-full flex items-center pointer-events-auto"
          style={{ willChange: 'transform' }}
          animate={
            scrolled
              ? {
                  maxWidth: 900,
                  borderRadius: 9999,
                  backgroundColor: '#ffffff',
                  boxShadow:
                    '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)',
                  paddingLeft: 32,
                  paddingRight: 32,
                  height: 56,
                  marginTop: 16,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }
              : {
                  maxWidth: 10000,
                  borderRadius: 0,
                  backgroundColor: 'rgba(255,255,255,0)',
                  boxShadow: '0 0 0 0 rgba(0,0,0,0)',
                  paddingLeft: 32,
                  paddingRight: 32,
                  height: 72,
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,
                }
          }
          transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 1 }}
        >
          {/* Left — flex-1 anchors logo to the left */}
          <div className="flex-1 flex items-center">
            <Link to="/" className="shrink-0">
              <img
                src="/Handmade-by-Caci-logo.png"
                alt="Handmade by Caci"
                className="h-24 w-auto pt-2"
              />
            </Link>
          </div>

          {/* Center — naturally centered by the two flex-1 flanks */}
          <nav className="hidden md:flex items-center gap-5 ">
            {activeCategories.map((cat) => (
              <NavLink
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className={navLinkClass}
              >
                {cat.name}
              </NavLink>
            ))}
          </nav>

          {/* Right — flex-1 justify-end anchors cart/user to the right */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <NavbarCartIcon />

            <div className="hidden md:flex items-center gap-3 ml-1">
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
        </motion.div>
      </div>

      {/* Mobile drawer — sibling of the fixed wrapper, not a child of motion.div */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-full bg-white z-[60] shadow-xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                <span className="font-heading text-gray-900">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
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
                {activeCategories.map((cat) => (
                  <NavLink
                    key={cat.id}
                    to={`/catalog?category=${cat.slug}`}
                    className={mobileLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.name}
                  </NavLink>
                ))}
              </nav>

              <div className="px-4 py-4 border-t border-border space-y-2">
                {user ? (
                  <>
                    <p className="text-sm text-gray-500 truncate">
                      {user.full_name || user.email}
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block text-sm text-gray-700 hover:text-gray-900 transition-colors py-1"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center rounded-md active:scale-95 transition-all duration-150 font-medium px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
