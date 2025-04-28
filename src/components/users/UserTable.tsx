
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { type User, getRoleName, formatDate } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onToggleStatus?: (id: number) => void; // Make this prop optional
  onDeleteUser?: (id: number) => void;
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onEditUser, 
  onToggleStatus,
  onDeleteUser,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Login Terakhir</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Login Terakhir</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleName(user.role)}</TableCell>
                  <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : "Belum login"}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditUser(user)}
                      >
                        Edit
                      </Button>
                      {onToggleStatus && (
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "outline"}
                          onClick={() => onToggleStatus(user.id)}
                        >
                          {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      )}
                      {onDeleteUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => onDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  className="text-center py-6 text-gray-500"
                >
                  Tidak ada data pengguna yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserTable;
