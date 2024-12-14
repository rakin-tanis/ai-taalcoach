'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/Table';
import Pagination from "@/components/ui/Pagination";
import { useSession } from 'next-auth/react';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'sonner';
import { User } from '@/types';
import { Modal } from '../ui/Modal';
import EditUser from './EditUser';
import { Button } from '../ui/Button';
import { Drama } from 'lucide-react';



export default function UserPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [userToEdit, setUserToEdit] = useState<User | undefined>()
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState('');
  const itemsPerPage = 10;

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Error", {
        description: 'Error fetching users. ' + JSON.stringify(error),
        duration: 5000,
      })
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/user?userId=${userToDeleteId}`, {
        method: 'DELETE',
      });
      fetchUsers(); // Refetch users after deletion
      setShowDeleteModal(false);
      const data = await response.json()
      toast.success("Success", {
        description: data.message,
        duration: 5000,
      })
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: 'Error deleting user. ' + JSON.stringify(error),
        duration: 5000,
      })
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === session!.user.id) return
    setUserToDeleteId(userId);
    setShowDeleteModal(true);
  };

  const editUser = (user: User) => {
    if (user._id === session!.user.id) return
    setUserToEdit(user)
    setIsModalOpen(true);
  }

  const handleUpdate = async (user: User) => {
    setIsUpdateLoading(true);
    try {
      const userId = user._id
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roles: user.roles,
          status: user.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      setUserToEdit(user)
      setUsers(prev => {
        return prev.map(u => {
          if (u._id == user._id) {
            u.roles = user.roles;
            u.status = user.status
          }
          return u;
        })
      })
      // fetchUsers()
      const data = await response.json()
      toast.success("Success", {
        description: data.message,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error updating user: ', error);
      toast.error("Error", {
        description: 'Failed to update user. ' + JSON.stringify(error),
        duration: 5000,
      })
    }
    finally {
      setIsUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Users</h1>
        <Input
          type="search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table className='rounded-xl bg-gray-50 dark:bg-gray-900'>
              <TableHeader>
                <TableRow className='hover:dark:bg-transparent hover:bg-transparent'>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Is Email Verified</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Login At</TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user._id} className={`text-gray-950 dark:text-white 
                  ${index % 2 === 0
                      ? "hover:dark:bg-gray-600 hover:bg-gray-200 dark:bg-gray-700 bg-gray-100"
                      : "hover:dark:bg-gray-600 hover:bg-gray-200 dark:bg-gray-900 bg-white"}`}>
                    {/* <TableCell>
                    {user.image ? <Image src={user.image} alt='user image' width={40} height={40} className='w-10' /> : <CircleUser />}
                  </TableCell> */}
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roles?.join(', ')}</TableCell>
                    <TableCell>{user.provider?.toUpperCase()}</TableCell>
                    <TableCell>{user.status?.toUpperCase()}</TableCell>
                    <TableCell>{user.isEmailVerified ? "YES" : "NO"}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <a
                        className={`hover:border-b-2 hover:border-b-blue-400 text-blue-900 dark:text-blue-400 ${user._id === session?.user.id ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                        onClick={() => editUser(user)}
                        aria-disabled={user._id === session?.user.id}
                      >
                        Edit
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        className={`hover:border-b-2 hover:border-b-blue-400 text-blue-900 dark:text-blue-400 ${user._id === session?.user.id ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                        onClick={() => deleteUser(user._id)}
                      >
                        Delete
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-24"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            total={total}
            page={page}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange} />


          {/* Edit Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <EditUser
              user={userToEdit}
              isLoading={isUpdateLoading}
              updateUser={handleUpdate}
              cancel={() => setIsModalOpen(false)} />
          </Modal>

          {/* Delete Modal */}
          <ConfirmModal
            showConfirmModal={showDeleteModal}
            confirmText={'Are you sure you want to delete this user?'}
            handleDeleteConfirm={handleDeleteConfirm}
            handleDeleteCancel={() => setShowDeleteModal(false)} />

          <Button
            variant='outline'
            className='flex gap-2'
            onClick={() => router.push("/admin/roles")}
          >
            <Drama className='w-5 h-5 ' />
            USER ROLES
          </Button>
        </>
      )}
    </div>
  );
}
