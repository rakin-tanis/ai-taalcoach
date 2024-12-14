'use client'

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';
import Image from "next/image";
import { Check, CircleUserRound } from 'lucide-react';
import useRoles from '@/hooks/useRoles';

interface EditUserProps {
  user?: User
  isLoading: boolean
  updateUser: (user: User) => Promise<void>
  cancel: () => void
}

export default function EditUser({ user, isLoading, updateUser, cancel }: EditUserProps) {
  const [roles, setRoles] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const { roles: roleOptions, loading, error } = useRoles();

  useEffect(() => {
    setRoles(user?.roles || []);
    setStatus(user?.status || "");
  }, [user])

  useEffect(() => {
    setRoles(user?.roles || []);
    setStatus(user?.status || "");
  }, [user])

  const toggleRole = (role: string) => {
    setRoles(prevRoles =>
      prevRoles.includes(role)
        ? prevRoles.filter(r => r !== role)
        : [...prevRoles, role]
    );
  };

  const handleStatusChange = (event: ChangeEvent) => {
    setStatus(((event.target) as HTMLInputElement).value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      updateUser({ ...user, roles, status })
    }
  };

  return (
    <div className="space-y-4 p-4 min-w-96">
      <h1 className="text-2xl font-bold dark:text-gray-200">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {user?.image ? (
            <Image
              src={user.image}
              alt="User profile"
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <CircleUserRound className="w-20 h-20 dark:text-gray-200" />
          )}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400">
            Name
          </label>
          <label id="name" className="block text-lg font-medium dark:text-gray-100">
            {user?.name}
          </label>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400">
            Email
          </label>
          <label id="email" className="block text-lg font-medium dark:text-gray-100">
            {user?.email}
          </label>
        </div>
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-400">
            Provider
          </label>
          <label id="provider" className="block text-lg font-medium dark:text-gray-100">
            {user?.provider}
          </label>
        </div>
        <div>
          <label htmlFor="createdAt" className="block text-sm font-medium text-gray-400">
            Created At
          </label>
          <label id="createdAt" className="block text-lg font-medium dark:text-gray-100">
            {user ? new Date(user?.createdAt).toLocaleString() : '-'}
          </label>
        </div>
        <div>
          <label htmlFor="lastLoginAt" className="block text-sm font-medium text-gray-400">
            Last Login At
          </label>
          <label id="lastLoginAt" className="block text-lg font-medium dark:text-gray-100">
            {user ? new Date(user?.lastLoginAt).toLocaleString() : '-'}
          </label>
        </div>
        <div>
          <label htmlFor="isEmailVerified" className="block text-sm font-medium text-gray-400">
            Is Email Verified
          </label>
          <label id="isEmailVerified" className="block text-lg font-medium dark:text-gray-100">
            {user?.isEmailVerified ? "YES" : "NO"}
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Roles
          </label>
          {loading ?
            <div>Loading</div>
            : error ?
              <div>{error}</div>
              : <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role._id}
                    type="button"
                    onClick={() => toggleRole(role.name)}
                    className={`
                  flex items-center px-3 py-1 rounded-full text-sm 
                  transition-colors duration-200 ease-in-out
                  ${roles.includes(role.name)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                `}
                  >
                    {roles.includes(role.name) && (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    {role.name}
                  </button>
                ))}
              </div>}
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-400">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={handleStatusChange}
            className="dark:text-black mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6 border-t pt-4 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={cancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isLoading}
            isLoading={isLoading}
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}