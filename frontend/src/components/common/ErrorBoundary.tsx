import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

function ErrorFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-2xl font-heading text-gray-900">{t('errors.somethingWentWrong')}</h1>
      <p className="text-sm text-gray-500">{t('errors.unexpected')}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-2 text-sm active:scale-95 transition-all duration-150"
      >
        {t('errors.reload')}
      </button>
    </div>
  );
}

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}
