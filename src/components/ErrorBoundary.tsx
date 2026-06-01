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
        <div className="error-boundary">
          <h1>حدث خطأ</h1>
          <p>{this.state.error?.message || 'Something went wrong'}</p>
          <button
            className="error-btn"
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
