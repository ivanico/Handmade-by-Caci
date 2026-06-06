import { useEffect } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    authApi.me()
      .then(({ data }) => setAuth(data, token))
      .catch(() => logout());
  }, []);

  return <>{children}</>;
}
