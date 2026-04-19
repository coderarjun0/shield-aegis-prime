import { useState, useEffect, useCallback } from 'react';

export const useShieldAI = (url: string) => {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'FLAGGED' | 'VERIFIED'>('IDLE');
  const [data, setData] = useState<any>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const startScan = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('SHIELD_AI: Neural Link Established');
      setStatus('SCANNING');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Logic to transition states based on backend data
      if (message.status === 'flagged') setStatus('FLAGGED');
      if (message.status === 'verified') setStatus('VERIFIED');
      setData(message);
    };

    ws.onclose = () => {
      console.log('SHIELD_AI: Neural Link Offline');
      if (status === 'SCANNING') setStatus('IDLE');
    };

    setSocket(ws);
  }, [url, status]);

  return { status, data, startScan };
};
