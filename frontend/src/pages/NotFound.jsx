import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="not-found"><span className="eyebrow">404 · Lost in the stars</span><h1>This page wandered off.</h1><p>Let's take you back to somewhere lovely.</p><Link className="primary-button" to="/">Back home</Link></div>; }
