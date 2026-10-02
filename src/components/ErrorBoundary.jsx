import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative z-50 min-h-screen flex items-center justify-center p-6 text-center">
          <div className="glass-strong rounded-2xl p-8 max-w-sm w-full">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h1>
            <p className="text-white/50 mb-6 text-sm">Maaf, sistem mengalami gangguan saat merender antarmuka. Silakan muat ulang halaman.</p>
            <button 
              onClick={() => {
                localStorage.removeItem('currentSessionId');
                window.location.href = '/';
              }} 
              className="glass-button-primary w-full"
            >
              Kembali ke Awal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
