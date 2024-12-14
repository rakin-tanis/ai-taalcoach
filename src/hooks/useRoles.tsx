// hooks/useRolesApi.ts
import { Role } from '@/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';


const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    console.log('fetch roles')
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
      return data
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

  const addRole = async (role: Role) => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
      if (!response.ok) throw new Error('Failed to add role');
      await response.json();
      fetchRoles();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  const updateRole = async (role: Role) => {
    try {
      const response = await fetch(`/api/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
      if (!response.ok) throw new Error('Failed to update role');
      const data = await response.json();
      toast.success("Success", {
        description: data.message,
      })
      setRoles((prev) => prev.map(r => r._id === role._id ? role : r));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles?roleId=${roleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete role');
      setRoles((prev) => prev.filter((role) => role._id !== roleId));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  return { roles, loading, error, fetchRoles, addRole, updateRole, deleteRole };
};

export default useRoles;