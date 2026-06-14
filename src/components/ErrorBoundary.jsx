import React from 'react';

// Catches render/runtime errors in its subtree so a crash shows a readable
// panel instead of a blank white screen, and logs details to the console.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{
          maxWidth: '560px', margin: '40px auto', padding: '28px',
          background: 'linear-gradient(to bottom, rgba(42,36,28,0.97), rgba(26,22,18,0.97))',
          border: '1px solid rgba(212,175,55,0.4)', borderRadius: '10px',
          boxShadow: '0 0 30px rgba(0,0,0,0.6)', textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: '1.2rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#D4AF37', margin: '0 0 12px',
          }}>Something went wrong</h2>
          <p style={{
            fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: '1rem',
            color: 'rgba(245,245,220,0.7)', lineHeight: 1.6, margin: '0 0 16px',
          }}>
            This view hit an error and couldn't render. Your progress is safe.
          </p>
          <pre style={{
            textAlign: 'left', fontSize: '0.78rem', color: 'rgba(220,140,120,0.85)',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.15)',
            borderRadius: '6px', padding: '10px 12px', overflowX: 'auto',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 18px',
          }}>{String(this.state.error?.message || this.state.error)}</pre>
          <button
            onClick={this.handleReset}
            style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', padding: '10px 24px', borderRadius: '6px',
              background: 'rgba(184,134,11,0.4)', border: '1px solid rgba(212,175,55,0.7)',
              color: '#D4AF37', cursor: 'pointer',
            }}
          >Go Back</button>
        </div>
      );
    }
    return this.props.children;
  }
}
