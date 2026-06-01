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
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0e27',
            color: '#e8e0d0',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              fontFamily: 'Noto Naskh Arabic, serif',
            }}
          >
            حدث خطأ
          </h1>
          <p style={{ color: '#8b83a0', marginBottom: '2rem' }}>
            {this.state.error?.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, #d4a843, #c49430)',
              color: '#0a0e27',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Noto Naskh Arabic, serif',
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
