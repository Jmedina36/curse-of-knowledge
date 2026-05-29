import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{color:'red',padding:'20px',fontFamily:'monospace',whiteSpace:'pre-wrap'}}>
        RENDER ERROR: {this.state.error.message}{'\n'}{this.state.error.stack}
      </div>
    );
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
