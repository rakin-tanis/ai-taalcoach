import { Condition, operatorTypes, OperatorType, Permission, Role } from '@/types';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { CircleMinus, ClipboardPlus } from 'lucide-react';

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (role: Role) => void;
  onCancel: () => void;
  permissions: Permission[];
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSubmit, onCancel, permissions }) => {
  const [roleName, setRoleName] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setSelectedPermissions(role.permissions || []); // Set selected permissions if editing an existing role
    } else {
      setRoleName('');
      setSelectedPermissions([]); // Reset permissions for a new role
    }
  }, [role]);

  const handlePermissionChange = (permission: Permission) => {
    console.log(permission)
    setSelectedPermissions(prev => {
      const isExist = prev.find(p => p._id === permission._id);
      return (
        isExist
          ? prev.filter(p => (p._id !== permission._id))
          : [...prev, permission]
      )
    });
  };

  const handleConditionChange = (permission: Permission, newConditions: Condition[]) => {
    setSelectedPermissions(prev => {
      return prev.map(p => {
        if (p._id === permission._id) {
          return { ...p, conditions: newConditions };
        }
        return p;
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleName.trim()) {
      onSubmit({
        _id: role ? role._id : undefined,
        name: roleName.toUpperCase(),
        permissions: selectedPermissions.map(
          p => ({ ...p, conditions: p.conditions?.filter(c => c.attribute && c.value) }))
      });
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-md w-[800px]">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">{role ? 'Edit Role' : 'Add New Role'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-400 mb-1" htmlFor="roleName">Role Name</label>
          <input
            type="text"
            id="roleName"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
            required
          />
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Permissions</h3>
          <Table className="w-full">
            <TableHeader>
              <TableRow className='dark:hover:bg-gray-700'>
                <TableHead></TableHead>
                <TableHead>Permission</TableHead>
                <TableHead className='text-center w-[380px]'>Conditions</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map(permission => {
                const selectedPermission = selectedPermissions.find(p => p._id === permission._id);
                const conditions = selectedPermission ? selectedPermission.conditions : [];

                return (
                  <TableRow key={permission._id} className='dark:hover:bg-gray-700'>
                    <TableCell>
                      <input
                        type="checkbox"
                        id={permission._id}
                        checked={!!selectedPermission}
                        onChange={() => handlePermissionChange(permission)}
                      />
                    </TableCell>
                    <TableCell><div className='flex items-stretch dark:text-gray-200'>{permission.resource}:{permission.action}</div></TableCell>
                    <TableCell>
                      {selectedPermission && (
                        <div className='flex flex-col'>
                          {conditions?.map((condition, index) => (
                            <div key={index} className="flex items-center mb-1">
                              <input
                                type="text"
                                placeholder="Attribute"
                                value={condition.attribute}
                                onChange={(e) => {
                                  const newConditions = [...conditions];
                                  newConditions[index].attribute = e.target.value;
                                  handleConditionChange(permission, newConditions);
                                }}
                                className="p-1 border border-gray-300 rounded mr-2 dark:text-gray-200"
                              />

                              {/* New operator dropdown */}
                              <select
                                value={condition.operator || '='}
                                onChange={(e) => {
                                  const newConditions = [...conditions];
                                  newConditions[index].operator = e.target.value as OperatorType;
                                  handleConditionChange(permission, newConditions);
                                }}
                                className="p-1 border border-gray-300 rounded mr-2 dark:text-gray-200 w-[100px]"
                              >
                                {operatorTypes.map(op => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>

                              <input
                                type="text"
                                placeholder="Value"
                                value={condition.value as string}
                                onChange={(e) => {
                                  const newConditions = [...conditions];
                                  newConditions[index].value = e.target.value;
                                  handleConditionChange(permission, newConditions);
                                }}
                                className="p-1 border border-gray-300 rounded mr-2 dark:text-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newConditions = conditions.filter((_, i) => i !== index);
                                  handleConditionChange(permission, newConditions);
                                }}
                                className="text-red-500"
                              >
                                <CircleMinus className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {selectedPermission && <button
                        type="button"
                        onClick={() => handleConditionChange(permission, [...(conditions || []), { attribute: '', value: '', operator: 'eq' } as Condition])}
                        className="text-blue-500 align-top"
                      >
                        <ClipboardPlus className="w-6 h-6" />
                      </button>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            {role ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;