import client from '@/api/client';
import type { User } from '@/types/common';

interface LoginResponse {
  access_token: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/api/auth/login', { email, password }),

  register: (data: RegisterData) =>
    client.post<User>('/api/auth/register', data),

  me: () => client.get<User>('/api/auth/me'),

  logout: () => client.post('/api/auth/logout'),
};
