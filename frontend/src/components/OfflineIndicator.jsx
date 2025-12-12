import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setTimeout(() => setJustCameOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustCameOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !justCameOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert 
        className={`shadow-lg border-2 ${
          isOnline 
            ? 'bg-green-50 border-green-600' 
            : 'bg-orange-50 border-orange-600'
        }`}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-orange-600" />
          )}
          <AlertDescription className={isOnline ? 'text-green-900' : 'text-orange-900'}>
            {isOnline 
              ? 'You are back online! Data will sync automatically.' 
              : 'You are offline. Changes will be saved locally and synced when online.'}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default OfflineIndicator;