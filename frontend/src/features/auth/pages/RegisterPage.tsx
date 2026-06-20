import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register({ email, password, full_name: fullName });
      navigate('/login');
    } catch {
      setError(t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white border border-border rounded-md shadow-sm p-8">
        <h1 className="font-heading text-2xl text-gray-900 mb-6">{t('auth.createAccount')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary" isLoading={loading} className="w-full">
            {t('auth.createAccount')}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-dark hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
