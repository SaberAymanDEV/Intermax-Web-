import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

export default function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    // Log visit
    api('/api/visits', {
      method: 'POST',
      body: JSON.stringify({ page: location.pathname }),
    }).catch(err => console.error('Failed to log visit', err));
  }, [location.pathname]);

  return null;
}
