import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const online = () => setOffline(false);
    const offlineEvent = () => setOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offlineEvent);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offlineEvent); };
  }, []);
  return offline ? <div className="offline-indicator" role="status"><WifiOff size={15} /> You’re offline · cached pages remain available</div> : null;
}
