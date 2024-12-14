import { Permission } from '@/types';
import { useEffect, useState } from 'react';

const useFetchPermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/permissions'); // Adjust the endpoint as necessary
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data: Permission[] = await response.json();
        setPermissions(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading, error };
};

export default useFetchPermissions;