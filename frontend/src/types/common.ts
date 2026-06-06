export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  phone: string | null;
}