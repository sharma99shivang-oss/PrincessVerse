import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('PrincessVerse render error:', error); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="not-found error-screen"><span className="eyebrow">500 · A little cloud</span><h1>That page needs a moment.</h1><p>Your memories are safe. Try returning home or refreshing this page.</p><div className="error-actions"><button className="soft-button" onClick={() => window.location.reload()}>Retry</button><Link className="primary-button" to="/">Back home</Link></div></main>;
  }
}
