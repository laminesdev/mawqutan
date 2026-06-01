import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mawqutan Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-bg text-text-primary p-8 text-center" role="alert">
          <h1 className="text-3xl mb-4 font-arabic">حدث خطأ</h1>
          <p className="text-text-secondary mb-8 text-sm">{this.state.error?.message || 'Something went wrong'}</p>
          <button
            className="bg-gradient-to-br from-accent to-accent-hover text-bg border-none px-8 py-3 rounded-lg font-semibold cursor-pointer font-arabic hover:opacity-90 transition-opacity duration-200"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            إعادة التشغيل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
