import { Role } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/Table';
import { Button } from "../ui/Button";
import { FilePenLine, Trash2 } from "lucide-react";

const RolesList: React.FC<{ roles: Role[]; onEdit: (role: Role | null) => void; onDelete: (roleId: string) => void; onCancel: () => void }> = ({ roles, onEdit, onDelete, onCancel }) => {
  return (
    <div className="p-4 rounded-lg shadow-md w-[644px]">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Roles</h2>

      <Table className="min-w-full bg-gray-50 dark:bg-gray-900">
        <TableHeader>
          <TableRow className='dark:hover:bg-gray-700'>
            <TableHead className="text-left text-gray-600">Role Name</TableHead>
            <TableHead className="text-right text-gray-600">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length > 0 ? (
            roles.map((role, index) => (
              <TableRow key={role._id} className={`text-gray-950 dark:text-white 
                ${index % 2
                  ? "hover:dark:bg-gray-600 hover:bg-gray-200 dark:bg-gray-700 bg-gray-100"
                  : "hover:dark:bg-gray-600 hover:bg-gray-200 dark:bg-gray-900 bg-white"}`}>
                <TableCell className="border-b border-gray-300">{role.name.toUpperCase()}</TableCell>
                <TableCell className="border-b border-gray-300">
                  <div className="flex justify-end w-full">
                    <Button
                      size="sm"
                      variant='outline'
                      onClick={() => onEdit(role)}
                      className="flex gap-2">
                      <FilePenLine className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant="destructive"
                      onClick={() => onDelete(role._id!)}
                      className="ml-4 flex gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                No roles found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-4">
        <Button
          variant='outline'
          onClick={() => onCancel()}
          className="mt-4"
        >
          Cancel

        </Button>
        <Button
          variant='default'
          onClick={() => onEdit(null)}
          className="mt-4"
        >
          Add New Role

        </Button>
      </div>
    </div>
  );
};

export default RolesList;