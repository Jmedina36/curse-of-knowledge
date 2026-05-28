import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { padding: '20px', background: '#1a0000', color: '#ff6b6b', fontFamily: 'monospace', whiteSpace: 'pre-wrap', minHeight: '100vh' }
      }, '⚠️ RENDER ERROR:\n\n' + this.state.error.stack);
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
