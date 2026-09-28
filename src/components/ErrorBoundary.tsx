/** Beklenmedik bir hata olursa boş ekran yerine dostça bir "tekrar dene" ekranı gösterir. */
import { Component, type ReactNode } from 'react';
import { Mascot } from './Mascot';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Cizio hata:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="bg onb">
        <div className="onb__center">
          <Mascot size={120} mood="think" />
          <h1 className="title-lg">Hay aksi, bir şeyler ters gitti!</h1>
          <p className="sub">Çizimlerin güvende. Hadi ana sayfaya dönelim.</p>
          <button
            className="pill"
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = '#/';
            }}
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }
}
